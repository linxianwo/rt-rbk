{
  "targets": [
    {
      "target_name": "addon",
      "cflags!": [ "-fno-exceptions", "-Wno-comment", "-Wno-unused-variable" ],
      "cflags_cc!": [ "-fno-exceptions", "-Wno-comment", "-Wno-unused-variable" ],
      "sources": [ "addon.cc", "CommservWrapper.cc","oddsServ.cc","UDATETME.cc"],
      "include_dirs": [
        "<!@(node -p \"require('node-addon-api').include\")"
      ],
      'defines': [ 'NAPI_DISABLE_CPP_EXCEPTIONS' ],
    }
  ]
}
