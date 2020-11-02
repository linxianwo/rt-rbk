#include "CommservWrapper.h"
#include <string.h>
#include "oddsServ.h"
Napi::FunctionReference CommservWrapper::constructor;
COddsServ theTerminal;
Napi::Object CommservWrapper::Init(Napi::Env env, Napi::Object exports)
{
  Napi::HandleScope scope(env);

  Napi::Function func = DefineClass(env, "CommservWrapper", {InstanceMethod("handled", &CommservWrapper::HandleD)});

  constructor = Napi::Persistent(func);
  constructor.SuppressDestruct();

  exports.Set("CommservWrapper", func);
  if (!theTerminal.init())
  {
    printf("theTerminal.init() fail!!!");
  }
  return exports;
}

CommservWrapper::CommservWrapper(const Napi::CallbackInfo &info) : Napi::ObjectWrap<CommservWrapper>(info)
{
  Napi::Env env = info.Env();
  Napi::HandleScope scope(env);

  int length = info.Length();
}

Napi::Value CommservWrapper::HandleD(const Napi::CallbackInfo &info)
{
  int b = info[0].As<Napi::Number>().Int32Value();
  std::string c_staffId;
  std::string c_cstrPin;
  Napi::Array arrayEx = info[1].As<Napi::Array>();
  int dExListSize = info[2].As<Napi::Number>().Int32Value();
  std::string pdExcludeList[dExListSize];
  std::string result;
  switch (b)
  {
  case 1: // getOdds64
  {
    for (int i = 0; i < dExListSize; i++)
    {
      pdExcludeList[i] = static_cast<Napi::Value>(arrayEx[i]).As<Napi::String>();
      printf("\r %s", pdExcludeList[i].c_str());
    }

    // MSG_SIGN_ON send;
    // theTerminal.init();
    printf("\r theTerminal.init()");
    // strcpy(send.staffId, pdExcludeList[0].c_str());
    // strcpy(send.staffPin, pdExcludeList[1].c_str());
    int len = 0;
    // byte resBuf[MAX_MSG_BUF_SZ];
    // memset(resBuf, 0, MAX_MSG_BUF_SZ);
    // for (int i = 0; i < 64; i++)
    // {
    //   printf("%d ", resBuf[i]);
    // }
    // printf("\n");
    // CCommService::signon(send, len, resBuf);
    // for (int i = 0; i < len; i++)
    // {
    //   // printf("%x ", resBuf[i]);
    //   char ptmp[4] = "000";
    //   sprintf(ptmp, "%x ", resBuf[i]);
    //   result.append(ptmp);
    // }
  }
  //result.append();
  break;
  case 2: //getHhadCondChar
  {
  }
  break;
  case 3: //getHdcCondChar
  {
  }
  break;
  case 4: //getHiloScore
  {
  }
  break;
  default:
    break;
  }
  Napi::String obj = Napi::String::New(info.Env(), result);
  return obj;
}
