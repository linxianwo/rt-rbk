{
  "targets": [
    {
      "target_name": "addon",
      "cflags!": [ "-fno-exceptions", "-Wno-comment", "-Wno-unused-variable" ],
      "cflags_cc!": [ "-fno-exceptions", "-Wno-comment", "-Wno-unused-variable" ],
      "sources": [ "addon.cc", "ttst/TTSTWrapper.cc","ttst/TTST.cc","ttst/MSTkt.cc"],
      "include_dirs": [
        "<!@(node -p \"require('node-addon-api').include\")"
      ],
      'defines': [ 'NAPI_DISABLE_CPP_EXCEPTIONS' ],
    }
  ]
}
