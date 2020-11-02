/********************************************************************
*
*   @COPYRIGHT. This software is the property of the Royal Hong Kong
*   Jockey Club and is not to be disclosed, copied, or used in whole
*   or part without proper authorization.
*   6-Dec-94
*
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
*
*   CDefs.h
*
*   commonly used definitions
*
*********************************************************************/

#ifndef CDEFS_H
#define CDEFS_H



#ifndef _MSC_VER
//#include <ctype.h>
//#include <os2def.h>
#endif

#if defined( _WIN32 )
#pragma warning (disable: 4237)
#endif

// typedef int             bool;
typedef unsigned char   byte;
typedef unsigned short  int16;

/* true/false value already defined in isynonym.hpp */

#if defined( __OS2__ )

#ifndef _ISYNONYM_
#   include <isynonym.hpp>
#endif

#elif defined( _WIN32 )

#include "cmndefs.h"

#else
//#error unknown platform
#endif



#define todigit(n)  ( (int)(n) - '0' )       // this should be in CTYPE.H

#ifndef _MSC_VER
// inline char *skipSpaces( const char *p ) {
//     while ( isspace(*p) ) {
//         p ++ ;
//     }
//     return (char *) p ;
// }
#endif


#define BIT0        0x1
#define BIT1        0x2
#define BIT2        0x4
#define BIT3        0x8
#define BIT4        0x10
#define BIT5        0x20
#define BIT6        0x40
#define BIT7        0x80
#define BIT8        0x100
#define BIT9        0x200
#define BIT10       0x400
#define BIT11       0x800
#define BIT12       0x1000
#define BIT13       0x2000
#define BIT14       0x4000
#define BIT15       0x8000


///////////////////////////////////////////////////////////////////////
//
// Constants added to replace hard coded values in files
#define DEFAULT_WINDOW_ID  0x01
#define MSG_WIN_XLEFT      100
#define MSG_WIN_YBOTTOM    100
#define MSG_WIN_XRIGHT     500
#define MSG_WIN_YTOP       500

#define NEW_DEBUG(x)            ( new x )
#define NEW_ARRAY_DEBUG(x,y)    ( new x[y] )
#define DELETE_DEBUG(x)         ( delete x )
#define DELETE_ARRAY_DEBUG(x)   ( delete [] x )

#endif
