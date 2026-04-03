# EU AI Act MCP Server by Lexbeam

An open-source Model Context Protocol (MCP) server providing intelligence, classification, and compliance checking for the EU AI Act (Regulation (EU) 2024/1689).

Built by [Lexbeam Software](https://lexbeam.com), an agentic AI implementation boutique for regulated workflows.

## Features

This server provides five core tools to LLMs for reasoning about the EU AI Act:

1. **Classify AI System (`euaiact_classify_system`)**: Classifies an AI system's risk level (prohibited, high-risk, limited, minimal) based on a description and use case, checking against Annex III and Art. 5.
2. **Check Deadlines (`euaiact_check_deadlines`)**: Returns key implementation milestones, deadlines, and days remaining, including the status of the Digital Omnibus proposal.
3. **Get Obligations (`euaiact_get_obligations`)**: Returns specific compliance obligations based on the actor's role (provider/deployer) and the system's risk level.
4. **Answer FAQ (`euaiact_answer_question`)**: Semantic search against a database of the most common EU AI Act questions, returning answers with exact article references.
5. **Calculate Penalties (`euaiact_calculate_penalty`)**: Calculates maximum fines for violations based on violation type, global turnover, and SME status (Art. 99).

## Installation & Usage

### Running via npx (Recommended)

You can run this server directly without installation using `npx`:

```bash
npx -y @lexbeam/eu-ai-act-mcp
```

### Adding to Claude Desktop

Add this to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "eu-ai-act": {
      "command": "npx",
      "args": ["-y", "@lexbeam/eu-ai-act-mcp"]
    }
  }
}
```

### Running locally from source

```bash
git clone https://github.com/PicoWorx/eu-ai-act-mcp.git
cd eu-ai-act-mcp
npm install
npm run build
npm start
```

## Knowledge Base

The server is powered by a structured, curated knowledge base covering:
- **Prohibited Practices (Art. 5)**
- **High-Risk Categories (Annex III)**
- **Exceptions (Art. 6(3))**
- **Transparency Triggers (Art. 50)**
- **Implementation Deadlines & Milestones**
- **Provider & Deployer Obligations**
- **Penalty Framework (Art. 99)**

## License

MIT License. See [LICENSE](LICENSE) for details.

## About Lexbeam

[Lexbeam Software](https://lexbeam.com) builds agentic AI for compliance, legal operations, internal audit, and risk workflows. 
*Give us one ugly, regulation-heavy workflow. We'll turn it into a working AI system fast.*

**Disclaimer:** The information provided by this MCP server constitutes general guidance and not legal advice. For implementation support, [contact Lexbeam](https://lexbeam.com/kontakt).
