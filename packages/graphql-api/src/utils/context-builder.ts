import { ModuleConfig, ModuleSessionInfo } from '@graphql-modules/core';
import { getClientIp } from 'request-ip';
import { AccountsRequest, AccountsModuleConfig } from '../modules';

export const context = (moduleName: string) => async (
  { req, connection,jwtOnly,rawToken }: AccountsRequest,
  _: any,
  { injector }: ModuleSessionInfo
) => {
  // If connection is set it means it's a websocket connection coming from apollo
  if (connection) {
    return connection.context;
  }

  if (!req) {
    return {
      ip: '',
      userAgent: '',
      infos: {
        ip: '',
        userAgent: '',
      },
    };
  }

  const config: AccountsModuleConfig = injector.get(ModuleConfig(moduleName));

  let authToken;
  
    if(rawToken){
      authToken = rawToken
    }else{
      const headerName = config.headerName || 'Authorization';
      authToken =  (req.headers[headerName] || req.headers[headerName.toLowerCase()]) as string;
      authToken = authToken && authToken.replace('Bearer ', '');
    }
 

  let user;

  if (authToken && !config.excludeAddUserInContext) {
    try {
      user = await config.accountsServer.resumeSession(authToken,jwtOnly);
    } catch (error) {
      // Empty catch
    }
  }

  const ip = getClientIp(req);
  let userAgent: string = (req.headers['user-agent'] as string) || '';
  if (req.headers['x-ucbrowser-ua']) {
    // special case of UC Browser
    userAgent = req.headers['x-ucbrowser-ua'] as string;
  }

  return {
    authToken,
    user,
    userId: user && user.id,
    userAgent,
    ip,
    infos: {
      userAgent,
      ip,
    },
  };
};
