#include <napi.h>
#include "ttst/TTSTWrapper.h"



Napi::Object InitAll(Napi::Env env, Napi::Object exports) {
  TTSTWrapper::Init(env, exports);
}

NODE_API_MODULE(addon, InitAll)
