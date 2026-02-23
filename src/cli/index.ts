#!/usr/bin/env node

import { Command } from "commander";
import { serve } from "../server/serve.js";

const program = new Command();
program
	.name("json-log-viewer")
	.description("")
	.action(() => {
		serve();
	});

program
	.command("serve")
	.description("")
	.action(() => {
		serve();
	});

program
	.command("ingest")
	.description("")
	.action(async () => {});

program.parse();
