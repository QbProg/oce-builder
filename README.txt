OCE builder for MSVC (and other) compilers.

Usage:

From a Visual C++ command prompt:

- clone oce in the oce subdir
- clone oce-win-bundle in the bundle subdir
(you can use download.bat)
- edit Config.proj and disable the compilers you don't have (using Compiler_Enabled property)

> setenv.bat
> msbuild /t:All /tv:4.0

after the (long) compilation, you will find in each compiler dir the install folder which has a complete OCE distribution.

to erase the build directory
> msbuild /t:Erase /tv:4.0

to avoid reconfiguration
> msbuild /t:All /tv:4.0 /p:Step_Configure=false

