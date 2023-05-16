export class NoCommandFound extends Error {
  constructor(commandName: string) {
    super(`No command found with name "${commandName}"`);
  }
}
