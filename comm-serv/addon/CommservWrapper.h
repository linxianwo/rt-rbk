#ifndef MYOBJECT_H
#define MYOBJECT_H

#include <napi.h>

class CommservWrapper : public Napi::ObjectWrap<CommservWrapper>
{
public:
  static Napi::Object Init(Napi::Env env, Napi::Object exports);
  CommservWrapper(const Napi::CallbackInfo &info);

private:
  static Napi::FunctionReference constructor;

  Napi::Value HandleD(const Napi::CallbackInfo &info);
  double value_;
};

#endif
