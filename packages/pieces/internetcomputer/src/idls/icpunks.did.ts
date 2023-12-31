/* eslint-disable camelcase */
/* eslint-disable @typescript-eslint/camelcase */
import { IDL as idl } from "@dfinity/candid";

export default ({ IDL }: { IDL: typeof idl }) => {
  const Property = IDL.Record({ value: IDL.Text, name: IDL.Text });
  const TokenDesc = IDL.Record({
    id: IDL.Nat,
    url: IDL.Text,
    owner: IDL.Principal,
    desc: IDL.Text,
    name: IDL.Text,
    properties: IDL.Vec(Property),
  });
  const TokenIndex = IDL.Nat;

  const ICPunk = IDL.Service({
    data_of: IDL.Func([TokenIndex], [TokenDesc], []),
    transfer_to: IDL.Func([IDL.Principal, TokenIndex], [IDL.Bool], []),
    user_tokens: IDL.Func([IDL.Principal], [IDL.Vec(IDL.Nat)], []),
  });
  return ICPunk;
};
export const init = ({ IDL }: { IDL: typeof idl }) => {
  return [IDL.Text, IDL.Text, IDL.Nat, IDL.Principal];
};
