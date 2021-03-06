import { Message } from "discord.js";
import { EventActions, RegisteredEventAction } from "../../commandFramework";

@RegisteredEventAction
export class MessageCommandAction extends EventActions.MessageAction {
    readonly commandPrefix = "$";
    readonly ignorePrefix = "//"

    action(message : Message): void {
        if (!message)
            return;

        if (message.content.startsWith(this.ignorePrefix)) {
            return;
        }

        if (this.isMessageBotCommand(message)) {
            try {
                this.handleBotCommand(message);
            } catch(error) {
                this.logger.error(error);
                message.channel.send("There was an error executing this command.")
            }
        }
    }

    private isMessageBotCommand(message : Message) : boolean{
        return message.channel.type == "text" && message.content.slice(0, this.commandPrefix.length) == this.commandPrefix;
    }
    
    private handleBotCommand(message : Message) {
        try {
            let commandParts = this.seperateCommandParts(message.content);
            this.logger.verbose(message.author.tag + " typed command: " + commandParts.command)

            this.dependencies.commandFactory.build(commandParts.command, message, this.dependencies)?.execute()

        } catch (err) {

            throw err;
        }
    }

    private seperateCommandParts(fullComandString : String) {
        let parts = fullComandString.toLowerCase().split(" ");
        let command = parts[0].slice(this.commandPrefix.length, parts[0].length);
        let parameters = parts.slice(1, parts.length);

        let data = {command : command, parameters : parameters};
        return data
    }
}