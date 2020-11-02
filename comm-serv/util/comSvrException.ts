export class ComSvrException {
    constructor(public message: string, public level?: number) {}
    //   public ComSvrException(string message) : base(message)
    //   {
    //      // log.Error("CommunicationServ Layer Exception:" + message);
    //   }
    //   public ComSvrException(Exception ex) : base(string.Empty,ex)
    //   {
    //      // log.Error("CommunicationServ Layer Exception:" + ex.ToString());
    //   }
    //   public ComSvrException(string message, Exception innerException):base(message, innerException)
    //   {
    //      // log.Error("CommunicationServ Layer Exception:" + message);
    //   }

    //   public ComSvrException(string message, params object[] args) : base(message)
    //   {
    //       //log.Error("CommunicationServ Layer Exception:" + message, args);
    //   }
}
