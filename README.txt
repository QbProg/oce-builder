OCE builder for MSVC (and other) compilers.

Usage:

Prefer the MSBuild Command Prompt 2015 or any Visual C++ command prompt

- clone oce in the oce subdir
- clone oce-win-bundle in the oce/oce-win-bundle subdir
(you can use download.bat)
- edit build.js and disable the compilers you don't have

If you use MINGW, make sure you have the compiler on your path.

> setenv.bat
> build config
> build build

after the (long) compilation, you will find in each compiler dir the install folder which has a complete OCE distribution.

--
Cleanup of the build and install directories:

> build clean