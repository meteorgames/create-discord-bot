#!/usr/bin/env node

import chalk from "chalk";
import inquirer from "inquirer";
import gradient from "gradient-string";
import chalkAnimation from "chalk-animation";
import figlet from "figlet";
import { createSpinner } from "nanospinner";
import { downloadTemplate } from "giget";
import lmify from "lmify";
import fs from "fs/promises";

let config = {
	path: "./",
	prettier: true,
	eslint: true,
	pm: "npm",
};

const sleep = (ms = 2000) => new Promise((r) => setTimeout(r, ms));

async function welcome() {
	console.log(chalk.bold(gradient.atlas("Create Discord Bot - v1.0.0\n")));
}

async function packages() {
	let pkgs = {
		normal: [],
		saveDev: [],
	};

	pkgs.normal.push("discord.js");
	pkgs.normal.push("@types/node");
	pkgs.normal.push("dotenv");
	pkgs.saveDev.push("typescript");
	pkgs.saveDev.push("tsx");

	if (config.eslint) {
		pkgs.saveDev.push("eslint");
	}

	if (config.prettier) {
		pkgs.saveDev.push("prettier");
	}

	if (pkgs.saveDev.length > 0) {
		pkgs.saveDev.push("--save-dev");
	}

	return pkgs;
}

async function installRepos() {
	const spinner = createSpinner("Installing repositories\n").start();

	lmify.setPackageManager(config.pm);
	lmify.setRootDir(config.path);
	lmify.addGranter(async (packages) => {
		return true; // Allow
	});

	const pkgs = await packages();

	await lmify.install(pkgs.normal);

	if (pkgs.saveDev.length > 0) {
		console.clear();
		await lmify.install(pkgs.saveDev);
	}

	console.clear();
	spinner.success({ text: "Done!" });
}

async function setupDirectory() {
	const base = `github:meteorgames/create-discord-bot/templates/`;
	await downloadTemplate(`${base}typescript`, {
		dir: config.path,
		force: true,
	});

	if (config.prettier) {
		await downloadTemplate(`${base}prettier`, {
			dir: config.path,
			force: true,
		});
	}

	if (config.eslint) {
		await downloadTemplate(`${base}eslint`, {
			dir: config.path,
			force: true,
		});
	}
}

async function getLanguage() {
	const path = await inquirer.prompt({
		name: "answer",
		type: "input",
		message: "Where would you like to create your bot?",
		default() {
			return "./";
		},
	});

	const prettier = await inquirer.prompt({
		name: "answer",
		type: "confirm",
		message: `Would you like to use ${chalk.redBright("Prettier")}?`,
		default() {
			return "y";
		},
	});

	const eslint = await inquirer.prompt({
		name: "answer",
		type: "confirm",
		message: `Would you like to use ${chalk.blueBright("ESLint")}?`,
		default() {
			return "y";
		},
	});

	const pm = await inquirer.prompt({
		name: "answer",
		type: "list",
		message: "What package manager you like to use?",
		choices: ["npm", "yarn"],
		default() {
			return "npm";
		},
	});

	config.path = path.answer;
	config.prettier = prettier.answer;
	config.eslint = eslint.answer;
	config.pm = pm.answer;

	console.clear();

	const install = await inquirer.prompt({
		name: "answer",
		type: "confirm",
		message: "Do you want to install the necessary repositories?",
		default() {
			return true;
		},
	});

	const spinner = createSpinner("Setting up boilerplate\n").start();

	await setupDirectory();

	if (install.answer) {
		await installRepos();
	}
}

await welcome();
await getLanguage();
