declare module 'eris-boiler/permissions' {
  import {
    Permission, DataClient
  } from 'eris-boiler'
  
  const admin: Permission
  const owner: Permission
  const vip: Permission

  function createGeneric<T extends DataClient>(x: Permission): Permission<T>
}
