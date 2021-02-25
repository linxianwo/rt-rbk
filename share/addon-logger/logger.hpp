#ifndef _LOGGER_H_
#define _LOGGER_H_

// C++ Header File(s)
#include <iostream>
#include <fstream>
#include <sstream>
#include <string>
// Win Socket Header File(s)
#ifdef WIN32
#include <Windows.h>
#include <process.h>
#else
#include <unistd.h>
#include <pthread.h>
#endif

namespace CPlusPlusLogging
{
// enum for LOG_LEVEL
typedef enum LOG_LEVEL
{
    DISABLE_LOG = 1,
    LOG_LEVEL_TRACE = 2,
    LOG_LEVEL_DEBUG = 3,
    ENABLE_LOG = 4,
} LogLevel;

// enum for LOG_TYPE
typedef enum LOG_TYPE
{
    NO_LOG = 1,
    CONSOLE = 2,
    FILE_LOG = 3,
} LogType;

class Logger
{
public:
    static Logger *getInstance() throw();

    static std::string getCurrentTime();
    static void setModuleName(std::string moduleName);

    // Interface for Trace log
    void trace(const char *text, std::string time, std::string file, int line) throw();
    void trace(std::string &text, std::string time, std::string file, int line) throw();
    void trace(std::ostringstream &stream, std::string time, std::string file, int line) throw();

    // Interface for Debug log
    void debug(const char *text, std::string time, std::string file, int line) throw();
    void debug(std::string &text, std::string time, std::string file, int line) throw();
    void debug(std::ostringstream &stream, std::string time, std::string file, int line) throw();

    // Error and Alarm log must be always enable
    // Hence, there is no interfce to control error and alarm logs

    // Interfaces to control log levels
    void updateLogLevel(LogLevel logLevel);
    void enableLog();  // Enable all log levels
    void disableLog(); // Disable all log levels, except error and alarm

    // Interfaces to control log Types
    void updateLogType(LogType logType);
    void enableConsoleLogging();
    void enableFileLogging();

protected:
    Logger();
    ~Logger();

    // Wrapper function for lock/unlock
    // For Extensible feature, lock and unlock should be in protected
    void lock();
    void unlock();

private:
    void logIntoFile(std::string &data);
    void logOnConsole(std::string &data);
    Logger(const Logger &obj) {}
    void operator=(const Logger &obj) {}

private:
    static Logger *m_Instance;
    std::ofstream m_File;
    static std::string m_module;
#ifdef WIN32
    CRITICAL_SECTION m_Mutex;
#else
    pthread_mutex_t m_Mutex;
#endif
    LogLevel m_LogLevel;
    LogType m_LogType;
};

} // namespace CPlusPlusLogging


// Direct Interface for logging into log file or console using MACRO(s)
#define SETMODULENAME(x) CPlusPlusLogging::Logger::setModuleName(x);
#define TRACE(x) CPlusPlusLogging::Logger::getInstance()->trace(x, CPlusPlusLogging::Logger::getCurrentTime(), __FILE__, __LINE__);
#define DEBUG(x) CPlusPlusLogging::Logger::getInstance()->debug(x, CPlusPlusLogging::Logger::getCurrentTime(), __FILE__, __LINE__);

#endif // End of _LOGGER_H_
