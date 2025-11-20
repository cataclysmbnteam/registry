---
layout: base.tsx
title: Manifest Generator
description: Generate mod manifest YAML files for the BN Mod Registry
---

<link rel="stylesheet" href="/manifest-generator.css" />

<h1>Manifest Generator</h1>

<p>
  Use this tool to generate manifest YAML files for submitting mods to the registry.
  You can manually fill in the fields, upload a <code>modinfo.json</code> file,
  or fetch mod info directly from a GitHub repository.
</p>

<div id="manifest-generator">
  <noscript>
    <p>JavaScript is required for the manifest generator.</p>
  </noscript>
</div>

<script type="module" src="/app/main.js"></script>
