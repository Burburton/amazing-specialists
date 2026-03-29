const { GitHubClient } = require('./github-client');

class LabelSetup {
  constructor(githubClient, labelConfig) {
    this.client = githubClient;
    this.labelConfig = labelConfig;
  }

  async run(owner, repo) {
    const results = { created: [], skipped: [], failed: [] };
    
    for (const label of this.labelConfig.labels) {
      try {
        const existing = await this._getLabel(owner, repo, label.name);
        if (existing) {
          results.skipped.push(label.name);
        } else {
          await this._createLabel(owner, repo, label);
          results.created.push(label.name);
        }
      } catch (error) {
        results.failed.push({ name: label.name, error: error.message });
      }
    }
    
    return results;
  }

  async _getLabel(owner, repo, name) {
    try {
      const path = `/repos/${owner}/${repo}/labels/${encodeURIComponent(name)}`;
      return await this.client._request('GET', path);
    } catch (error) {
      if (error.status === 404) return null;
      throw error;
    }
  }

  async _createLabel(owner, repo, label) {
    const path = `/repos/${owner}/${repo}/labels`;
    await this.client._request('POST', path, {
      name: label.name,
      color: label.color,
      description: label.description || ''
    });
  }

  formatReport(results) {
    return `Label Setup Report:
- Created: ${results.created.length} (${results.created.join(', ') || 'none'})
- Skipped: ${results.skipped.length} (${results.skipped.join(', ') || 'none'})
- Failed: ${results.failed.length} (${results.failed.map(f => f.name).join(', ') || 'none'})`;
  }
}

async function main() {
  const argv = require('minimist')(process.argv.slice(2));
  
  if (!argv.owner || !argv.repo) {
    console.error('Usage: node setup-labels.js --owner <owner> --repo <repo>');
    process.exit(1);
  }

  const client = new GitHubClient();
  const labelConfig = require('./labels.json');
  const setup = new LabelSetup(client, labelConfig);
  
  console.log(`Setting up labels for ${argv.owner}/${argv.repo}...`);
  const results = await setup.run(argv.owner, argv.repo);
  console.log(setup.formatReport(results));
}

if (require.main === module) {
  main().catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
  });
}

module.exports = { LabelSetup };