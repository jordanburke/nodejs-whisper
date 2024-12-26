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

execSync(`export CXXFLAGS='${config.cxxflags}' && cd cpp/whisper.cpp && cmake -B build && cmake --build build -j && cp build/bin/${config.binary} main`, {stdio: 'inherit'})