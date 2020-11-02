#include <napi.h>
#include "CommservWrapper.h"

Napi::Object InitAll(Napi::Env env, Napi::Object exports)
{
  CommservWrapper::Init(env, exports);
}

NODE_API_MODULE(addon, InitAll)
