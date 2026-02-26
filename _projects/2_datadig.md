---
layout: page
title: DataDig - Financial News Analysis
description: A real-time financial news intelligent analysis system for the global market, featuring async pipelines and 3-layer incremental clustering.
importance: 2
category: engineering
---

## Overview

Independently designed at **Feiou Technology** (Oct 2025 -- present), DataDig is a real-time financial news intelligent analysis system for the global market. The entire system comprises **15,000+ lines of Python**.

## System Architecture

Full async pipeline orchestrated by **Dagster**:

**Kafka consumer** --> **LLM multi-dimensional feature extraction** --> **3-layer incremental clustering** --> **Event fusion**

- 8-way parallel snippet extraction
- Incremental updates every 5 minutes

## 3-Layer Real-Time Clustering

- **Layer 1**: HAC (cosine >= 0.8) deduplication
- **Layer 2**: Semantic clustering (cosine >= 0.6) with summary generation
- **Layer 3**: LLM structured output (Pydantic Schema) for merge/new/ignore decisions, fusing real-time clusters into a 365-day long-term event table

## Cross-Cycle Cluster Stability

- **Jaccard similarity UUID mapping** + two-phase post-repair (anti-split/anti-merge) for stable cluster boundaries under incremental HAC
- **Embedding stabilization** (cosine >= 0.9 reuses old vectors) to suppress cascading effects from LLM phrasing variation
