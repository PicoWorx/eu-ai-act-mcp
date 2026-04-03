# EU AI Act MCP Server

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![npm version](https://img.shields.io/npm/v/@lexbeam-software/eu-ai-act-mcp)](https://www.npmjs.com/package/@lexbeam-software/eu-ai-act-mcp)

An open-source [Model Context Protocol](https://modelcontextprotocol.io) (MCP) server that gives LLMs structured intelligence about the EU AI Act (Regulation (EU) 2024/1689).

Built by [Lexbeam Software](https://lexbeam.com) - an agentic AI implementation boutique for regulated workflows.

## Tools

| Tool | Description |
|------|-------------|
| `euaiact_classify_system` | Classify an AI system's risk level (prohibited / high-risk / limited / minimal) based on description and use case. Checks Art. 5, Annex III, and Art. 50. |
| `euaiact_check_deadlines` | Returns implementation milestones with days remaining, plus the Digital Omnibus proposal status. |
| `euaiact_get_obligations` | Specific compliance obligations by role (provider/deployer) and risk level, including GPAI (Art. 51-56) and universal AI literacy (Art. 4). |
| `euaiact_answer_question` | Semantic FAQ search across 20 common EU AI Act questions with article references. |
| `euaiact_calculate_penalty` | Calculate maximum fines by violation type, turnover, and SME status (Art. 99). |

## Quick Start

### npx (no install)

```bash
npx -y @lexbeam-software/eu-ai-act-mcp
```

### Claude Desktop

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "eu-ai-act": {
      "command": "npx",
      "args": ["-y", "@lexbeam-software/eu-ai-act-mcp"]
    }
  }
}
```

### From source

```bash
git clone https://github.com/PicoWorx/eu-ai-act-mcp.git
cd eu-ai-act-mcp
npm install
npm run build
npm start
```

## Knowledge Base

Curated, structured data covering:

- **8 Annex III high-risk categories** with keyword matching
- **8 prohibited AI practices** (Art. 5)
- **Art. 6(3) exception conditions**
- **Art. 50 transparency triggers** (chatbots, deepfakes, emotion recognition)
- **5 implementation milestones** with dynamic days-remaining calculation
- **Digital Omnibus proposal** status and impact assessment
- **Provider obligations** (13 for high-risk, 8 for GPAI)
- **Deployer obligations** (8 for high-risk)
- **Limited risk transparency obligations** (4)
- **Universal AI literacy** (Art. 4)
- **Penalty framework** with SME protection logic (Art. 99)
- **20 FAQ entries** with article references and Lexbeam knowledge base links

All dates, articles, and obligations verified against the regulation text.

## Regulatory Accuracy

This server tracks the current state of the EU AI Act as published (Regulation 2024/1689). The Digital Omnibus proposal (December 2025) is included but clearly marked as `proposal_only` - not yet adopted law.

Key dates verified:
- 2 Feb 2025: Prohibited practices + AI literacy (in effect)
- 2 Aug 2025: GPAI obligations (in effect)
- 2 Aug 2026: High-risk Annex III obligations (upcoming)
- 2 Aug 2027: Annex I regulated products (upcoming)

## Disclaimer

The information provided by this MCP server constitutes general guidance and not legal advice. For implementation support, visit [lexbeam.com/kontakt](https://lexbeam.com/kontakt).

## License

MIT. See [LICENSE](LICENSE).

## About Lexbeam

[Lexbeam Software](https://lexbeam.com) builds agentic AI for compliance, legal operations, internal audit, and risk workflows.

*Give us one ugly, regulation-heavy workflow. We'll turn it into a working AI system fast.*
