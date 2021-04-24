import * as vscode from 'vscode';
import * as https from 'https';

// convert latex -> svg
const url = "https://latex.codecogs.com/svg.latex?";
const convertLatex2Svg = (text: string) => {
    return new Promise<string>((resolve, reject) => {
        https.get(url + encodeURIComponent(text), (res) => {
            if (res.statusCode === 200) {
                res.on('data', (d: Buffer) => resolve(d.toString()));
            } else {
                reject(new Error(`${res.statusCode} ${res.statusMessage}`));
            }
        }).on('error', (e) => reject(e));
    });
};

export function activate(context: vscode.ExtensionContext) {
    console.log('"tex2svg" is now active.');
    const disposable = vscode.commands.registerCommand('tex2svg.convert', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) { return; }
        const selection = editor.selection;
        if (selection.isEmpty) { return; }
        const text = editor.document.getText(selection);
        if (text.charAt(0) !== '$' || text.charAt(text.length - 1) !== '$') {
            return;
        }

        const mathString = text.substring(1, text.length - 1);
        try {
            const svgString = await convertLatex2Svg(mathString);
            await editor.edit((edit) => edit.replace(selection, svgString));

        } catch (e) {
            console.error(e);
            await vscode.window.showErrorMessage(`Math2Svg: ${e.name} ${e.message}`);
        }
    });

    context.subscriptions.push(disposable);
}

export function deactivate() { }
