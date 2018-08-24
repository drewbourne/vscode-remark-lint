'use strict';

import * as vscode from 'vscode';
import engine from 'unified-engine';
import remark from 'remark';
import vfile, { VFileMessage, VFile } from 'vfile';
import hrtime from 'pretty-hrtime';

let diagnosticCollection: vscode.DiagnosticCollection;
let statusBarItem: vscode.StatusBarItem;
let outputChannel: vscode.OutputChannel;

export function activate(context: vscode.ExtensionContext) {
  diagnosticCollection = vscode.languages.createDiagnosticCollection(
    'remark-lint-diagnostics'
  );

  outputChannel = vscode.window.createOutputChannel('remark-lint');
  outputChannel.appendLine('[remark-lint] Activated');

  statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    -1
  );

  statusBarItem.command = 'remark-lint.show-output';
  statusBarItem.text = 'remark-lint';
  statusBarItem.show();

  context.subscriptions.push(
    vscode.commands.registerCommand('remark-lint.show-output', () => {
      outputChannel.show();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('remark-lint.lint-markdown', () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        outputChannel.appendLine('Unable to execute: No active editor');
        return;
      }

      return execute(editor.document);
    })
  );

  context.subscriptions.push(
    vscode.workspace.onDidSaveTextDocument((document: vscode.TextDocument) => {
      execute(document);
    })
  );

  context.subscriptions.push(
    vscode.workspace.onDidOpenTextDocument((document: vscode.TextDocument) => {
      execute(document);
    })
  );

  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor(
      (e: vscode.TextEditor | undefined) => {
        if (e) {
          execute(e.document);
        }
      }
    )
  );
}

// this method is called when your extension is deactivated
export function deactivate() {
  diagnosticCollection.clear();
  diagnosticCollection.dispose();

  statusBarItem.hide();
  statusBarItem.dispose();

  outputChannel.clear();
  outputChannel.dispose();
}

function execute(document: vscode.TextDocument) {
  if (document.languageId !== 'markdown') {
    return;
  }

  const file = vfile({
    path: document.fileName,
    contents: document.getText(),
  });

  const extensions = require('markdown-extensions');

  if (!file.extname || extensions.indexOf(file.extname.slice(1)) === -1) {
    outputChannel.appendLine(
      `Unsupported file extension for filename: ${document.fileName}`
    );
    return;
  }

  return new Promise((resolve, reject) => {
    const start = process.hrtime();

    engine(
      {
        processor: remark(),
        files: [file],
        rcName: '.remarkrc',
        pluginPrefix: 'remark',
        presetPrefix: 'remark-preset',
        packageField: 'remarkConfig',
        ignoreName: '.remarkignore',
        extensions: extensions,
        reporter: (results) => {
          const elapsed = process.hrtime(start);
          reportVFileMessagesAsDiagnostics(document, results[0], elapsed);
          resolve();
        },
      },
      (error, code, context) => {
        if (!error) return;

        outputChannel.appendLine('');
        outputChannel.appendLine(`${document.fileName}`);
        outputChannel.appendLine('');
        outputChannel.appendLine(`Error running processor`);
        outputChannel.appendLine('');
        outputChannel.appendLine(error.toString());
        outputChannel.appendLine(``);
        outputChannel.appendLine(`code: ${code}`);
        outputChannel.appendLine(`context: ${context}`);

        reject(error);
      }
    );
  });
}

function reportVFileMessagesAsDiagnostics(
  document: vscode.TextDocument,
  vfile: VFile<{
    path: string;
    contents: string;
    messages: VFileMessage[];
  }>,
  elapsed: [number, number]
) {
  const { messages } = vfile;

  outputChannel.appendLine('');
  outputChannel.appendLine(`${document.fileName}`);
  outputChannel.appendLine('');
  messages.forEach((msg: VFileMessage) => {
    outputChannel.appendLine(`[${msg.ruleId}] ${msg.reason}`);
  });
  outputChannel.appendLine('');
  outputChannel.appendLine(`${messages.length} Warnings, ${hrtime(elapsed)}`);
  outputChannel.appendLine('');

  if (messages) {
    const diagnostics: vscode.Diagnostic[] = messages.map(
      (msg: VFileMessage) => ({
        source: 'remark',
        code: `${msg.source}.${msg.ruleId}`,
        message: `${msg.ruleId ? `[${msg.ruleId}] ` : ''}${msg.reason}`,
        range: new vscode.Range(
          new vscode.Position(
            (msg.location.start.line || msg.line || 1) - 1,
            (msg.location.start.column || msg.column || 1) - 1
          ),
          new vscode.Position(
            (msg.location.end.line || msg.line || 1) - 1,
            msg.location.end.column || msg.column || 1
          )
        ),
        severity: vscode.DiagnosticSeverity.Error,
      })
    );

    statusBarItem.text = `remark-lint ${
      diagnostics.length ? '$(x)' : '$(check)'
    }`;
    diagnosticCollection.set(document.uri, diagnostics);
  } else {
    statusBarItem.text = `remark-lint $(check)`;
    diagnosticCollection.clear();
  }
}
