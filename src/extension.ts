'use strict';

import * as vscode from 'vscode';
import engine from 'unified-engine';
import remark from 'remark';
import vfile, { VFileMessage, VFile } from 'vfile';

let diagnosticCollection: vscode.DiagnosticCollection;
let statusBarItem: vscode.StatusBarItem;
let outputChannel: vscode.OutputChannel;

export function activate(context: vscode.ExtensionContext) {
  diagnosticCollection = vscode.languages.createDiagnosticCollection(
    'remark-lint-diagnostics'
  );

  outputChannel = vscode.window.createOutputChannel('remark-lint');
  outputChannel.appendLine('activated');

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
        outputChannel.appendLine('lint-markdown, no active editor');
        return;
      }

      const document = editor.document;
      outputChannel.appendLine(`lint-markdown, document ${document.uri}`);
      return execute(document);
    })
  );
}

vscode.workspace.onDidSaveTextDocument((document: vscode.TextDocument) => {
  execute(document);
});

// vscode.workspace.onDidOpenTextDocument()
// vscode.workspace.onDidCloseTextDocument()
// vscode.workspace.onDidChangeTextDocument((e: vscode.TextDocumentChangeEvent) => {
//   e.document
// })

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
  outputChannel.appendLine(`execute ${document.fileName} ${document.uri}`);

  const file = vfile({
    path: document.fileName,
    contents: document.getText(),
  });

  return new Promise((resolve, reject) => {
    engine(
      {
        processor: remark(),
        files: [file],
        rcName: '.remarkrc',
        pluginPrefix: 'remark',
        presetPrefix: 'remark-preset',
        packageField: 'remarkConfig',
        ignoreName: '.remarkignore',
        extensions: require('markdown-extensions'),
        reporter: (results) => {
          reportVFileMessagesAsDiagnostics(document, results[0]);
          resolve();
        },
      },
      (error, code, context) => {
        // outputChannel.appendLine(`error ${error}`);
        // outputChannel.appendLine(`code ${code}`);
        // outputChannel.appendLine(`context ${context}`);
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
  }>
) {
  const { messages } = vfile;

  outputChannel.appendLine(`messages ${messages.length}`);
  messages.forEach((msg: VFileMessage) => {
    outputChannel.appendLine(`[${msg.ruleId}] ${msg.reason}`);
  });

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
