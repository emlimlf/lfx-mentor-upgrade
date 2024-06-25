// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { LoggerService, LogLevel } from './logger.service';

describe('LoggerService', () => {
  const message = 'message';

  beforeEach(() => {
    console.log = jasmine.createSpy('log');
    console.error = jasmine.createSpy('error');
    console.warn = jasmine.createSpy('warn');
    console.info = jasmine.createSpy('info');
    console.debug = jasmine.createSpy('debug');
  });

  it('is frozen', () => {
    const logger = new LoggerService(LogLevel.None);
    expect(Object.isFrozen(logger)).toBeTruthy();
  });

  describe('error', () => {
    it("shouldn't log when loglevel is below Error", () => {
      const logger = new LoggerService(LogLevel.None);
      logger.error(message);
      expect(console.error).not.toHaveBeenCalled();
    });
    it('should log when loglevel is Error', () => {
      const logger = new LoggerService(LogLevel.Error);
      logger.error(message);
      expect(console.error).toHaveBeenCalledWith(message);
    });
    it('should log when loglevel is above Error', () => {
      const logger = new LoggerService(LogLevel.Warn);
      logger.error(message);
      expect(console.error).toHaveBeenCalledWith(message);
    });
  });

  describe('warn', () => {
    it("shouldn't log when loglevel is below Warn", () => {
      const logger = new LoggerService(LogLevel.Error);
      logger.warn(message);
      expect(console.warn).not.toHaveBeenCalled();
    });
    it('should log when loglevel is Warn', () => {
      const logger = new LoggerService(LogLevel.Warn);
      logger.warn(message);
      expect(console.warn).toHaveBeenCalledWith(message);
    });
    it('should log when loglevel is above Warn', () => {
      const logger = new LoggerService(LogLevel.Verbose);
      logger.warn(message);
      expect(console.warn).toHaveBeenCalledWith(message);
    });
  });

  describe('verbose', () => {
    it("shouldn't log when loglevel is below Verbose", () => {
      const logger = new LoggerService(LogLevel.Warn);
      logger.verbose(message);
      expect(console.log).not.toHaveBeenCalled();
    });
    it('should log when loglevel is Info', () => {
      const logger = new LoggerService(LogLevel.Verbose);
      logger.verbose(message);
      expect(console.log).toHaveBeenCalled();
    });
  });
});
