const { spawn } = require('child_process')
const path = require('path')

const isWin = process.platform === 'win32'
const python = isWin
  ? path.join('venv', 'Scripts', 'python.exe')
  : path.join('venv', 'bin', 'python')

const proc = spawn(python, ['app.py'], {
  cwd: path.join(__dirname, '..', 'backend'),
  stdio: 'inherit',
  shell: isWin,
})

proc.on('exit', (code) => process.exit(code ?? 0))
