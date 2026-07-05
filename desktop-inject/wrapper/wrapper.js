/**
 * Claude Tracker wrapper for Claude Desktop (Linux, bundled Electron).
 * Lives at resources/app/ — Electron prefers this dir over app.asar, so it
 * loads automatically with zero launcher/asar changes. Hooks every
 * WebContents, injects the tracker bundle on load, then requires the
 * untouched original app.asar to boot the real app.
 */
'use strict';

const path = require('path');
const fs = require('fs');
const { app } = require('electron');

const ORIGINAL_ASAR = path.join(__dirname, '..', 'app.asar');
const BUNDLE_PATH = path.join(__dirname, 'tracker-bundle.js');

let bundle = null;
try {
	bundle = fs.readFileSync(BUNDLE_PATH, 'utf8');
} catch (e) {
	console.error('[ClaudeTracker] bundle missing:', e.message);
}

if (bundle) {
	app.on('web-contents-created', (_event, contents) => {
		contents.on('did-finish-load', () => {
			contents.executeJavaScript(bundle, true).catch((err) => {
				console.error('[ClaudeTracker] inject failed:', err && err.message);
			});
		});
	});
}

require(ORIGINAL_ASAR);
