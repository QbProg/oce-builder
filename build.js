var opt_testing = false;
var opt_full_testing = false;
var opt_install = true;
var opt_install_pdb = true;
var opt_generateStatics = true;
var opt_generateShared = true;

var tcldir32 = "C:/tcl/";
var tcldir64 = "C:/tcl64/";
var tclversion = "86";

var OCEOptions = ["-D OCE_ADD_HEADERS=ON",
                  "-D OCE_DATAEXCHANGE=OFF",
                  "-D OCE_DRAW=ON",
                  "-D OCE_MODEL=ON",
                  "-D OCE_OCAF=ON",
                  "-D OCE_VISUALISATION=ON",
                  "-D OCE_WITH_FREEIMAGE=ON",
                  "-D OCE_WITH_GL2PS=ON",                  
                  "-D OCE_ENABLE_DEB_FLAG=OFF",
                  "-D OCE_USE_PCH=ON",
                  "-D OCE_MULTITHREAD_LIBRARY=NONE"];

var inputConfigs = [
  {
      id : "MSVC2010",
      text : "Visual C++ 2010",
      multiconfig : true,
      generators : ["Visual Studio 10","Visual Studio 10 Win64"],
      platforms : ["Win32" , "Win64"],
      configs : ["Debug","RelWithDebInfo"],
      toolsets : [""],
      generateStaticBuild : true,
      enabled : true
  },  
  {
      id : "MSVC2012",
      text : "Visual C++ 2012",
      multiconfig : true,
      generators : ["Visual Studio 11","Visual Studio 11 Win64"],
      platforms : ["Win32" , "Win64"],
      configs : ["Debug","RelWithDebInfo"],
      installConfig : "RelWithDebInfo",
      toolsets : ["","v110_xp"],
      generateStaticBuild : true,
      enabled : true
  },
  {
      id : "MSVC2013",
      text : "Visual C++ 2013",
      multiconfig : true,
      generators : ["Visual Studio 12","Visual Studio 12 Win64"],
      platforms : ["Win32" , "Win64"],
      configs : ["Debug","RelWithDebInfo"],
      installConfig : "RelWithDebInfo",
      toolsets : ["","v120_xp"],
      generateStaticBuild : true,
      enabled : true
  },
  {
      id : "MSVC2015",
      text : "Visual C++ 2015",
      multiconfig : true,
      generators : ["Visual Studio 14","Visual Studio 14 Win64"],
      platforms : ["Win32" , "Win64"],
      configs : ["Debug","RelWithDebInfo"],
      toolsets : ["","v140_xp"],
      generateStaticBuild : true,
      enabled : true
  }
];

var buildConfigs = [];

var explodeConfigs = function()
{
  inputConfigs.forEach( function(inpConf) {
      if(!inpConf.enabled)
        return;
      inpConf.generators.forEach( function(gen,genidx) {
        inpConf.toolsets.forEach( function(toolset) {
          var i = Object.create(inpConf);
          i.generator = gen;
          i.toolset = toolset;
          i.is_static = false
          i.id = inpConf.id + "_" + inpConf.platforms[genidx] + (toolset != "" ? ("_" + toolset) : "");
          i.installDir = inpConf.id + (toolset != "" ? ("_" + toolset) : "")
          i.tcldir = inpConf.platforms[genidx] == "Win32" ? tcldir32 : tcldir64;
          
          if(opt_generateShared)
            buildConfigs.push(i);
          if(inpConf.generateStaticBuild && opt_generateStatics)
          {
            var i2 = Object.create(i);
            i2.is_static = true;
            i2.id = i2.id + "_static";
            i2.installDir = i2.installDir + "_static";
            if(opt_generateStatics)
              buildConfigs.push(i2);
          }
        });
      });    
    });
}

var displayConfigs = function()
{
  buildConfigs.forEach( function(i) {
    log.message("Config : " + i.id);
    });
};

var generateConfig = function(config)
{
  var buildDir = "build/" + config.id + "_build";
  var installDir = wd + "/install/" + config.installDir + "";
  var tcldir = config.tcldir;
  var OCECommonConfig = OCEOptions.join(" ");
  var TCLOpts = " -D TCL_INCLUDE_PATH=" + tcldir + "/include -D TCL_LIBRARY=" + tcldir + "/lib/tcl" + tclversion + ".lib -D TCL_TCLSH=" + tcldir + "/bin/tclsh.exe";
  var TKOpts = " -D TK_INCLUDE_PATH=" + tcldir + "/include -D TK_LIBRARY=" + tcldir + "/lib/tk" + tclversion + ".lib -D TK_WISH=" + tcldir + "/bin/wish.exe";
  var OCESpecificConfig = " ";
  if (config.is_static)
    OCESpecificConfig += " -D OCE_BUILD_SHARED_LIB=OFF";
  else
    OCESpecificConfig += " -D OCE_BUILD_SHARED_LIB=ON";
  
  OCESpecificConfig += " -D OCE_TESTING=" + (opt_testing ? "ON" : "OFF");
  OCESpecificConfig += " -D OCE_USE_TCL_TEST_FRAMEWORK=" + (opt_full_testing && !config.is_static) ? "ON" : "OFF";
  OCESpecificConfig += " -D OCE_INSTALL_PDB_FILES=" + (opt_install_pdb ? "ON" : "OFF");
  folder.create(buildDir);
  var path = "cmake ";
  
  var cmake_toolset = "";
  if(config.toolset != "")
    cmake_toolset = " -T \"" + config.toolset + "\"";
  var args = "-G \"" + config.generator + "\"" + cmake_toolset + " -D OCE_INSTALL_PREFIX=\"" + installDir + "\" " + OCECommonConfig + OCESpecificConfig + TCLOpts + TKOpts + " H:/oce/oce";
  
  log.message("Configuring " + config.id + " - " + config.text);
  shell.system(path + args,buildDir) ;
}

var compileConfig_msvc = function(config)
{
  var buildDir = "build/" + config.id + "_build";
  var projectFile = "OCE.sln";
  var installFile = "INSTALL.vcxproj";
  config.configs.forEach(function(cfg) {
      shell.cd(buildDir);
      shell.system("msbuild " + projectFile + " /m /p:Configuration="+cfg) ;
      if(opt_install)
        shell.system("msbuild " + installFile + " /m /p:Configuration="+cfg) ;
      shell.cd("../..");
  });
}

log.message(env.param1);

explodeConfigs();
displayConfigs();

if(env.param1 == "")
{
   log.message("OCE BUILDER Usage:");
   log.message("build.bat config");
   log.message("build.bat build");
   log.message("build.bat all");
   log.message("build.bat clean");
}

if(env.param1 === "config" || env.param1 == "all")
{
  buildConfigs.forEach( function(i) {
    generateConfig(i);
  });
}

if(env.param1 == "build" || env.param1 == "all")
{
  buildConfigs.forEach( function(i) {
    compileConfig_msvc(i);
   });
}

if(env.param1 == "clean")
{
  folder.remove("build/");
  folder.remove("install/");
}

// Debug
//generateConfig(buildConfigs[0]);
//compileConfig_msvc(buildConfigs[0]);
