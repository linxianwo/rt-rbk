// C++ Header File(s)

#include <cstdlib>
#include <ctime>
#include <pwd.h>
// #include <stdlib.h>

#include "logger.hpp"

// Code Specific Header Files(s)

using namespace std;
using namespace CPlusPlusLogging;

Logger *Logger::m_Instance = 0;
std::string Logger::m_module = "";

void Logger::setModuleName(std::string moduleName)
{
    m_module = moduleName;
};

Logger::Logger()
{
    // Log file name. File name should be change from here only
    // string fileName = "/home/ubuntu/.Kiosk/logs/addon-";
    ostringstream fileName;
    const char *homedir;
    if ((homedir = getenv("HOME")) == NULL)
    {
        homedir = getpwuid(getuid())->pw_dir;
    }
    fileName << homedir;
    // cout << "Filename: " << fileName.str().c_str() << endl;
    fileName << "/.Kiosk/logs/";
    if (!m_module.empty())
    {
        fileName << m_module << "/";
    }
    fileName << "addon-";
    // cout << "Filename: " << fileName.str().c_str() << endl;

    //Current date/time based on current time
    time_t now = time(0);
    char dateTime[64] = {0};
    int len = strftime(dateTime, sizeof(dateTime), "%d-%m-%y", localtime(&now));
    fileName << dateTime << ".log";
    // cout << "Filename: " << fileName.str().c_str() << endl;
    // Convert current time to string
    // currTime.assign(dateTime);

    // const string logFileName = "/home/ubuntu/.Kiosk/logs/addon.log";
    m_File.open(fileName.str().c_str(), ios::out | ios::app);
    m_LogLevel = ENABLE_LOG;
    m_LogType = FILE_LOG;

// Initialize mutex
#ifdef WIN32
    InitializeCriticalSection(&m_Mutex);
#else
    m_Mutex = PTHREAD_MUTEX_INITIALIZER;
#endif
}

Logger::~Logger()
{
    m_File.flush();
    m_File.close();
#ifdef WIN32
    DeleteCriticalSection(&m_Mutex);
#endif
}

Logger *Logger::getInstance() throw()
{
    if (m_Instance == 0)
    {
        m_Instance = new Logger();
    }
    return m_Instance;
}

void Logger::lock()
{
#ifdef WIN32
    EnterCriticalSection(&m_Mutex);
#else
    pthread_mutex_lock(&m_Mutex);
#endif
}

void Logger::unlock()
{
#ifdef WIN32
    LeaveCriticalSection(&m_Mutex);
#else
    pthread_mutex_unlock(&m_Mutex);
#endif
}

void Logger::logIntoFile(std::string &data)
{
    lock();
    // m_File << getCurrentTime() << "  " << data << endl;
    m_File << data << endl;
    unlock();
}

void Logger::logOnConsole(std::string &data)
{
    // cout << getCurrentTime() << "  " << data << endl;
}

string Logger::getCurrentTime()
{
    string currTime;
    //Current date/time based on current time
    time_t now = time(0);
    // Convert current time to string
    currTime.assign(ctime(&now));

    // Last charactor of currentTime is "\n", so remove it
    string currentTime = currTime.substr(0, currTime.size() - 1);
    return currentTime;
}

// Interface for Trace Log
void Logger::trace(const char *text, std::string time, std::string file, int line) throw()
{
    string data;
    data.append("[TRACE] [");

    int pid = getpid();
    data.append(std::to_string(pid));

    string locations = "] [" + time + "] [" + file + " " + std::to_string(line) + "] ";
    data.append(locations);
    data.append(text);

    if ((m_LogType == FILE_LOG) && (m_LogLevel >= LOG_LEVEL_TRACE))
    {
        logIntoFile(data);
    }
    else if ((m_LogType == CONSOLE) && (m_LogLevel >= LOG_LEVEL_TRACE))
    {
        logOnConsole(data);
    }
}

void Logger::trace(std::string &text, std::string time, std::string file, int line) throw()
{
    trace(text.data(), time, file, line);
}

void Logger::trace(std::ostringstream &stream, std::string time, std::string file, int line) throw()
{
    string text = stream.str();
    trace(text.data(), time, file, line);
}

// Interface for Debug Log
void Logger::debug(const char *text, std::string time, std::string file, int line) throw()
{
    string data;
    data.append("[DEBUG] [");

    int pid = getpid();
    data.append(std::to_string(pid));

    string locations = "] [" + time + "] [" + file + " " + std::to_string(line) + "] ";
    data.append(locations);
    data.append(text);

    if ((m_LogType == FILE_LOG) && (m_LogLevel >= LOG_LEVEL_DEBUG))
    {
        logIntoFile(data);
    }
    else if ((m_LogType == CONSOLE) && (m_LogLevel >= LOG_LEVEL_DEBUG))
    {
        logOnConsole(data);
    }
}

void Logger::debug(std::string &text, std::string time, std::string file, int line) throw()
{
    debug(text.data(), time, file, line);
}

void Logger::debug(std::ostringstream &stream, std::string time, std::string file, int line) throw()
{
    string text = stream.str();
    debug(text.data(), time, file, line);
}

// Interfaces to control log levels
void Logger::updateLogLevel(LogLevel logLevel)
{
    m_LogLevel = logLevel;
}

// Enable all log levels
void Logger::enableLog()
{
    m_LogLevel = ENABLE_LOG;
}

// Disable all log levels, except error and alarm
void Logger::disableLog()
{
    m_LogLevel = DISABLE_LOG;
}

// Interfaces to control log Types
void Logger::updateLogType(LogType logType)
{
    m_LogType = logType;
}

void Logger::enableConsoleLogging()
{
    m_LogType = CONSOLE;
}

void Logger::enableFileLogging()
{
    m_LogType = FILE_LOG;
}
