---
layout: page
title: Graph RAG for Causal Reasoning
description: A Graph RAG system enhancing LLM reasoning through structured text generation, achieving 47.5% F1 improvement on Corr2Cause benchmark.
importance: 1
category: research
---

## Overview

Developed during my internship at **Nokia Bell Labs** (Mar 2025 -- Oct 2025), this project addresses the challenge of enabling LLMs to perform accurate causal reasoning over scientific texts.

## Architecture

The system implements a **3-stage architecture**:

1. **Regex-constrained JSON tool calling** with 100% schema compliance
2. **Knowledge graph construction** with 95% entity precision and 92% disambiguation accuracy
3. **NL-to-Cypher query** with 100% syntax validity

## Key Innovation

- **Hybrid BM25-vector retrieval** for entity disambiguation
- **Semantic-aware document chunking** that preserves causal relationships
- **Qwen3-32B-based** tool calling and structured output
- Significantly reduced hallucination and improved multi-hop reasoning

## Results

| Metric | Baseline | Graph RAG | Improvement |
|--------|----------|-----------|-------------|
| F1 Score | 32.71 | 48.26 | +47.5% |
| Schema Compliance | - | 100% | - |
| Entity Precision | - | 95% | - |
| Syntax Validity | - | 100% | - |
