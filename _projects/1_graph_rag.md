---
layout: page
title: Graph RAG for Causal Reasoning
description: A Graph RAG system that structures LLM reasoning over correlational text, raising F1 from 32.7 to 48.3 (+47.5% relative) on the Corr2Cause benchmark.
importance: 1
category: research
---

## Overview

LLMs remain unreliable at telling causation from correlation — on the Corr2Cause benchmark, even GPT-4 barely beats a random baseline. Developed during my internship at **Nokia Bell Labs** (Mar 2025 -- Oct 2025), this project guides the model to first build a structured knowledge graph from the correlational premises and then reason over it, instead of answering causal queries directly. This raises F1 from 32.71 to 48.26 (**+15.6 points, a 47.5% relative gain**).

The work is published as [Structured Thinking Matters: Improving LLMs Generalization in Causal Inference Tasks (arXiv:2505.18034)](https://arxiv.org/abs/2505.18034).

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
| F1 Score | 32.71 | 48.26 | +15.6 pts (+47.5% relative) |
| Schema Compliance | - | 100% | - |
| Entity Precision | - | 95% | - |
| Syntax Validity | - | 100% | - |
