const { platform } = require('os')
const { execSync } = require('child_process')

const platformConfigs = {
    darwin: {
        cxxflags: '-isystem /Library/Developer/CommandLineTools/SDKs/MacOSX.sdk/usr/include/c++/v1',
        binary: 'whisper-cli'
    },
    linux: {
        cxxflags: '',
        binary: 'whisper-cli'
    },
    win32: {
        cxxflags: '',
        binary: 'whisper-cli.exe'
    }
}

const config = platformConfigs[platform()] || platformConfigs.linux

const cmd = `cd cpp/whisper.cpp && cmake -DCMAKE_CXX_FLAGS="${config.cxxflags}" -B build && cmake --build build --config Release && cp build/bin/${config.binary} main`

execSync(cmd, {
    stdio: 'inherit',
    env: { ...process.env, CXXFLAGS: config.cxxflags }
})