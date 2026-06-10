---
layout: page
title: Humanoid Robot Navigation
description: Perception-navigation system for wheeled humanoid robots with centimeter-level relocalization, developed at Chinese Academy of Sciences.
importance: 3
category: research
---

## Overview

Wheeled humanoid robots need to know precisely where they are before they can act — and recovering that pose after being moved or restarted is slow with standard stacks. At the **Institute of Automation, Chinese Academy of Sciences** (Mar 2024 -- Sep 2024, Prof. Qiao Hong's team), I built the perception-navigation system that fuses LiDAR and depth-camera data to deliver centimeter-level relocalization and whole-body path planning, cutting relocalization time by 80%.

## Technical Contributions

### Sensor Fusion

- Fused **solid-state LiDAR** (fastlio2 + octomap) with **depth camera** (Intel D435i)
- Used **EKF** to fuse multi-source pose data
- Reduced relocalization time by **80%**

### Path Planning

- Developed **SLAM-based RRT\*** path planning plugin
- Refactored mini planner to replace Nav2
- Reduced computation by **30%**

## Results

- Achieved **whole-body path planning** and **centimeter-level relocalization** accuracy
- Successfully demonstrated autonomous navigation in complex indoor environments
