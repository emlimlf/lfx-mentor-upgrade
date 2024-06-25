// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { LoadTransactionPageAction, TransactionPageActionTypes } from './transactions.page.actions';

describe('BackerPageActionTypes', () => {
  describe('LoadBackerPageAction', () => {
    it('should return a projectid and cursor', () => {
      const action = new LoadTransactionPageAction('projectid', 'cursor123');
      expect(action.type).toEqual(TransactionPageActionTypes.LOAD_PAGE);
      expect(action.payload.projectId).toEqual('projectid');
      expect(action.payload.cursor).toEqual('cursor123');
    });
  });
});
