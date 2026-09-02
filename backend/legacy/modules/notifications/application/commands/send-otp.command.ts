export class SendOtpCommand {
  constructor(
    public readonly destination: string,
    public readonly channel: 'EMAIL' | 'WHATSAPP' | 'SMS' = 'EMAIL',
  ) {}
}
