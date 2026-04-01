/**
 * GitHub Issue Body Parser
 * 
 * Parses GitHub Issue body markdown sections into structured data.
 * Reference: specs/021-github-issue-adapter/spec.md
 * Reference: docs/adapters/github-issue-adapter-design.md
 * Reference: specs/032-workflow-extensibility-enhancements/spec.md (R1: Body Parser 可配置)
 */

/**
 * Section headers expected in Issue body (legacy, for backward compatibility)
 */
const EXPECTED_SECTIONS = [
  'Context',
  'Goal',
  'Constraints',
  'Inputs',
  'Expected Outputs'
];

/**
 * Default sections configuration
 * Used when no config is provided to parseWithConfig()
 * 
 * Reference: adapters/schemas/body-parser-config.schema.json
 */
const DEFAULT_SECTIONS = {
  required: ['Goal'],
  recommended: ['Context', 'Expected Outputs'],
  optional: ['Constraints', 'Inputs'],
  mapping: {
    'Context': 'context.task_scope',
    'Goal': 'goal',
    'Constraints': 'constraints',
    'Inputs': 'inputs',
    'Expected Outputs': 'expected_outputs',
    'Acceptance Criteria': 'verification_steps',
    'Verification Steps': 'verification_steps'
  }
};

/**
 * Set a nested field value using dot notation path
 * @param {Object} obj - Target object
 * @param {string} path - Dot notation path (e.g., 'context.task_scope')
 * @param {*} value - Value to set
 */
function setNestedField(obj, path, value) {
  const parts = path.split('.');
  let current = obj;
  
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (!(part in current)) {
      current[part] = {};
    }
    current = current[part];
  }
  
  current[parts[parts.length - 1]] = value;
}

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
 */
function extractSection(body, sectionName) {
  if (!body || typeof body !== 'string') {
    return null;
  }

  const escapedName = sectionName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  
  const sectionRegex = new RegExp(
    `^##\\s+${escapedName}\\s*$\\n?(.*?)` +
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
 * Parse section content based on section type
 */
function parseSectionContent(sectionName, content) {
  if (!content) return null;
  
  if (sectionName.toLowerCase() === 'context') {
    return parseContextSection(content);
  }
  
  if (sectionName.toLowerCase() === 'inputs') {
    const refs = parseArtifactReferences(content);
    return refs.length > 0 ? refs : parseListItems(content);
  }
  
  const items = parseListItems(content);
  return items.length > 0 ? items : content;
}

/**
 * Body Parser Class
 */
class BodyParser {
  parse(body, fallbackTitle = '') {
    const result = {
      goal: '',
      description: '',
      context: { task_scope: '' },
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
        result.warnings.push('Used Issue title as goal (BR-003 fallback)');
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

  parseWithConfig(body, config, fallbackTitle = '') {
    const sectionsConfig = config?.body_parser_config?.sections || DEFAULT_SECTIONS;
    const mapping = sectionsConfig.mapping || DEFAULT_SECTIONS.mapping;
    const required = sectionsConfig.required || DEFAULT_SECTIONS.required;
    const recommended = sectionsConfig.recommended || [];
    const optional = sectionsConfig.optional || [];

    const result = {
      goal: '',
      description: '',
      context: { task_scope: '' },
      constraints: [],
      inputs: [],
      expected_outputs: [],
      verification_steps: [],
      missing_sections: [],
      missing_required: [],
      missing_recommended: [],
      warnings: [],
      parsed_sections: []
    };

    if (!body || typeof body !== 'string' || body.trim() === '') {
      result.warnings.push('Issue body is empty or null');
      result.missing_required = [...required];
      result.missing_recommended = [...recommended];
      result.missing_sections = [...required, ...recommended, ...optional];
      if (fallbackTitle) {
        result.goal = fallbackTitle;
        result.warnings.push('Used Issue title as goal (BR-003 fallback)');
      }
      return result;
    }

    result.description = body.trim();

    const allSections = new Set([
      ...required,
      ...recommended,
      ...optional,
      ...Object.keys(mapping)
    ]);

    for (const sectionName of allSections) {
      const content = extractSection(body, sectionName);
      
      if (!content) {
        if (required.includes(sectionName)) {
          result.missing_required.push(sectionName);
          result.missing_sections.push(sectionName);
          result.warnings.push(`Required section '${sectionName}' is missing`);
        } else if (recommended.includes(sectionName)) {
          result.missing_recommended.push(sectionName);
          result.missing_sections.push(sectionName);
          result.warnings.push(`Recommended section '${sectionName}' is missing`);
        }
        continue;
      }

      result.parsed_sections.push(sectionName);
      const parsedContent = parseSectionContent(sectionName, content);

      const targetField = mapping[sectionName];
      if (targetField) {
        setNestedField(result, targetField, parsedContent);
      } else {
        const fallbackField = sectionName.toLowerCase().replace(/\s+/g, '_');
        if (!(fallbackField in result)) {
          result[fallbackField] = parsedContent;
        }
      }
    }

    if (!result.goal && fallbackTitle) {
      result.goal = fallbackTitle;
      result.warnings.push('Goal section missing, used Issue title as fallback (BR-003)');
    }

    this._checkDuplicateSectionsConfig(body, result, allSections);

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

  _checkDuplicateSectionsConfig(body, result, sections) {
    for (const sectionName of sections) {
      const escapedName = sectionName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`^##\\s+${escapedName}\\s*$`, 'gm');
      const matches = body.match(regex);
      if (matches && matches.length > 1) {
        result.warnings.push(`Duplicate ## ${sectionName} section found (${matches.length} occurrences)`);
      }
    }
  }

  validateRequiredSections(body, requiredSections = ['Goal', 'Context']) {
    const missing = [];
    const warnings = [];

    if (!body || typeof body !== 'string' || body.trim() === '') {
      return { valid: false, missing: requiredSections, warnings: ['Issue body is empty'] };
    }

    for (const section of requiredSections) {
      const content = extractSection(body, section);
      if (!content) {
        missing.push(section);
        warnings.push(`Required section ## ${section} is missing`);
      }
    }

    return { valid: missing.length === 0, missing, warnings };
  }

  getExpectedSections() {
    return [...EXPECTED_SECTIONS];
  }

  getDefaultSectionsConfig() {
    return JSON.parse(JSON.stringify(DEFAULT_SECTIONS));
  }
}

module.exports = { 
  BodyParser, 
  EXPECTED_SECTIONS,
  DEFAULT_SECTIONS,
  extractSection,
  parseListItems,
  parseArtifactReferences,
  parseContextSection,
  setNestedField
};
