/**
 * GitHub Issue Body Parser
 * 
 * Parses GitHub Issue body markdown sections into structured data.
 * Reference: specs/021-github-issue-adapter/spec.md
 * Reference: docs/adapters/github-issue-adapter-design.md
 */

/**
 * Section headers expected in Issue body
 */
const EXPECTED_SECTIONS = [
  'Context',
  'Goal',
  'Constraints',
  'Inputs',
  'Expected Outputs'
];

/**
 * Parse markdown list items into array of strings
 * @param {string} content - Section content containing list items
 * @returns {string[]} - Array of list item texts
 */
function parseListItems(content) {
  if (!content || typeof content !== 'string') {
    return [];
  }

  const lines = content.trim().split('\n');
  const items = [];

  for (const line of lines) {
    // Match list item patterns: "- item", "* item", "1. item", "2. item"
    const listMatch = line.match(/^[-*]\s+(.+)$|^\d+\.\s+(.+)$/);
    if (listMatch) {
      const itemText = listMatch[1] || listMatch[2];
      if (itemText && itemText.trim()) {
        items.push(itemText.trim());
      }
    }
  }

  return items;
}

/**
 * Parse artifact reference from Inputs section
 * Supports formats:
 * - `artifact_id: ABC123`
 * - `artifact_type: design-note`
 * - `path: specs/001/design-note.md`
 * - `summary: Optional description`
 * 
 * Or inline format:
 * - `- artifact:ABC123 (design-note) at specs/001/design-note.md`
 * 
 * @param {string} content - Section content
 * @returns {Array<{artifact_id: string, artifact_type: string, path: string, summary?: string}>}
 */
function parseArtifactReferences(content) {
  if (!content || typeof content !== 'string') {
    return [];
  }

  const lines = content.trim().split('\n');
  const inputs = [];
  let currentArtifact = null;

  for (const line of lines) {
    const trimmedLine = line.trim();

    if (!trimmedLine || trimmedLine.startsWith('#')) {
      continue;
    }

    const listMatch = trimmedLine.match(/^[-*]\s+(.+)$|^\d+\.\s+(.+)$/);
    if (listMatch) {
      const itemText = (listMatch[1] || listMatch[2]).trim();

      // Parse inline format: artifact:ABC123 (design-note) at path
      const inlineMatch = itemText.match(/^artifact:([A-Za-z0-9_-]+)\s*\(([A-Za-z0-9_-]+)\)\s*(?:at\s+)?(.+)$/i);
      if (inlineMatch) {
        inputs.push({
          artifact_id: inlineMatch[1],
          artifact_type: inlineMatch[2],
          path: inlineMatch[3].trim(),
          summary: undefined
        });
        continue;
      }

      const propMatch = itemText.match(/^([a-z_]+):\s*(.+)$/i);
      if (propMatch) {
        const [, key, value] = propMatch;
        
        if (!currentArtifact) {
          currentArtifact = { artifact_id: '', artifact_type: '', path: '', summary: undefined };
        }

        if (key.toLowerCase() === 'artifact_id') {
          currentArtifact.artifact_id = value.trim();
        } else if (key.toLowerCase() === 'artifact_type') {
          currentArtifact.artifact_type = value.trim();
        } else if (key.toLowerCase() === 'path') {
          currentArtifact.path = value.trim();
        } else if (key.toLowerCase() === 'summary') {
          currentArtifact.summary = value.trim();
        }

        if (currentArtifact.artifact_id && currentArtifact.artifact_type && currentArtifact.path) {
          inputs.push(currentArtifact);
          currentArtifact = null;
        }
      } else {
        const looksLikePath = itemText.includes('/') || itemText.includes('\\') || itemText.endsWith('.md');
        if (looksLikePath) {
          inputs.push({
            artifact_id: '',
            artifact_type: '',
            path: itemText,
            summary: undefined
          });
        } else {
          inputs.push({
            artifact_id: itemText,
            artifact_type: '',
            path: '',
            summary: undefined
          });
        }
      }
    }
  }

  if (currentArtifact && currentArtifact.artifact_id) {
    inputs.push(currentArtifact);
  }

  return inputs;
}

/**
 * Extract section content from body by header name
 * @param {string} body - Full Issue body
 * @param {string} sectionName - Section header name (e.g., "Context", "Goal")
 * @returns {string|null} - Section content or null if not found
 */
function extractSection(body, sectionName) {
  if (!body || typeof body !== 'string') {
    return null;
  }

  // Match ## SectionName header and capture content until next ## header or end
  const sectionRegex = new RegExp(
    `^##\\s+${sectionName}\\s*$\\n?(.*?)` +
    `(?=^##\\s+|$)`,
    'gm'
  );

  const match = sectionRegex.exec(body);
  if (match && match[1]) {
    return match[1].trim();
  }

  return null;
}

/**
 * Parse context section content
 * May contain multiple subsections: task_scope, project_goal, milestone_goal, code_context_summary
 * 
 * @param {string} content - Context section content
 * @returns {{task_scope: string, project_goal?: string, milestone_goal?: string, code_context_summary?: string}}
 */
function parseContextSection(content) {
  if (!content || typeof content !== 'string') {
    return { task_scope: '' };
  }

  const taskScopeMatch = content.match(/^###\\s+Task Scope\\s*$\\n?(.*?)$(?=^###\\s+|$)/im);
  const projectGoalMatch = content.match(/^###\\s+Project Goal\\s*$\\n?(.*?)$(?=^###\\s+|$)/im);
  const milestoneGoalMatch = content.match(/^###\\s+Milestone Goal\\s*$\\n?(.*?)$(?=^###\\s+|$)/im);
  const codeContextMatch = content.match(/^###\\s+Code Context Summary\\s*$\\n?(.*?)$(?=^###\\s+|$)/im);

  const context = {
    task_scope: ''
  };

  if (taskScopeMatch) {
    context.task_scope = taskScopeMatch[1]?.trim() || '';
  } else {
    context.task_scope = content.trim();
  }

  if (projectGoalMatch && projectGoalMatch[1]) {
    context.project_goal = projectGoalMatch[1].trim();
  }

  if (milestoneGoalMatch && milestoneGoalMatch[1]) {
    context.milestone_goal = milestoneGoalMatch[1].trim();
  }

  if (codeContextMatch && codeContextMatch[1]) {
    context.code_context_summary = codeContextMatch[1].trim();
  }

  return context;
}

/**
 * Body Parser Class
 * 
 * Parses GitHub Issue body into structured BodyParseResult.
 */
class BodyParser {
  /**
   * Parse Issue body into structured result
   * 
   * @param {string} body - GitHub Issue body (markdown)
   * @param {string} [fallbackTitle] - Issue title to use as fallback goal (BR-003)
   * @returns {Object} BodyParseResult structure
   */
  parse(body, fallbackTitle = '') {
    const result = {
      goal: '',
      description: '',
      context: {
        task_scope: ''
      },
      constraints: [],
      inputs: [],
      expected_outputs: [],
      missing_sections: [],
      warnings: []
    };

    if (!body || typeof body !== 'string' || body.trim() === '') {
      result.warnings.push('Issue body is empty or null');
      result.missing_sections = [...EXPECTED_SECTIONS];
      
      if (fallbackTitle) {
        result.goal = fallbackTitle;
        result.warnings.push(`Used Issue title as goal (BR-003 fallback)`);
      }

      return result;
    }

    result.description = body.trim();

    const goalContent = extractSection(body, 'Goal');
    if (goalContent) {
      result.goal = goalContent;
    } else {
      result.missing_sections.push('Goal');
      if (fallbackTitle) {
        result.goal = fallbackTitle;
        result.warnings.push('Goal section missing, used Issue title as fallback (BR-003)');
      } else {
        result.warnings.push('Goal section missing and no fallback title provided');
      }
    }

    const contextContent = extractSection(body, 'Context');
    if (contextContent) {
      result.context = parseContextSection(contextContent);
    } else {
      result.missing_sections.push('Context');
      result.warnings.push('Context section missing');
    }

    const constraintsContent = extractSection(body, 'Constraints');
    if (constraintsContent) {
      result.constraints = parseListItems(constraintsContent);
      if (result.constraints.length === 0) {
        result.warnings.push('Constraints section found but contains no list items');
      }
    } else {
      result.missing_sections.push('Constraints');
    }

    const inputsContent = extractSection(body, 'Inputs');
    if (inputsContent) {
      result.inputs = parseArtifactReferences(inputsContent);
      if (result.inputs.length === 0) {
        result.warnings.push('Inputs section found but contains no artifact references');
      }
    } else {
      result.missing_sections.push('Inputs');
    }

    const outputsContent = extractSection(body, 'Expected Outputs');
    if (outputsContent) {
      result.expected_outputs = parseListItems(outputsContent);
      if (result.expected_outputs.length === 0) {
        result.warnings.push('Expected Outputs section found but contains no list items');
      }
    } else {
      result.missing_sections.push('Expected Outputs');
    }

    this._checkDuplicateSections(body, result);

    return result;
  }

  _checkDuplicateSections(body, result) {
    for (const sectionName of EXPECTED_SECTIONS) {
      const regex = new RegExp(`^##\\s+${sectionName}\\s*$`, 'gm');
      const matches = body.match(regex);
      if (matches && matches.length > 1) {
        result.warnings.push(`Duplicate ## ${sectionName} section found (${matches.length} occurrences)`);
      }
    }
  }

  /**
   * Validate that body has required sections
   * 
   * @param {string} body - Issue body
   * @param {string[]} [requiredSections=['Goal', 'Context']] - Sections that must exist
   * @returns {{valid: boolean, missing: string[], warnings: string[]}}
   */
  validateRequiredSections(body, requiredSections = ['Goal', 'Context']) {
    const missing = [];
    const warnings = [];

    if (!body || typeof body !== 'string' || body.trim() === '') {
      return {
        valid: false,
        missing: requiredSections,
        warnings: ['Issue body is empty']
      };
    }

    for (const section of requiredSections) {
      const content = extractSection(body, section);
      if (!content) {
        missing.push(section);
        warnings.push(`Required section ## ${section} is missing`);
      }
    }

    return {
      valid: missing.length === 0,
      missing,
      warnings
    };
  }

  getExpectedSections() {
    return [...EXPECTED_SECTIONS];
  }
}

module.exports = { BodyParser, EXPECTED_SECTIONS };