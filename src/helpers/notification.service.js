export async function notifyUser(event) {
    switch (event.title) {
        case "Order accepted by courier":
            console.log(`The order ${event.orderId} has been accepted by the courier ${event.courier}`);
            break;
        case "Order picked up by courier":
            console.log(`The order ${event.orderId} has been picked up by the courier ${event.courier} at the restaurant ${event.restaurant}`);
            break;
        case "Courier arrived at destination":
            console.log(`The courier ${event.courier} has arrived at the address ${event.userAddress}`);
            break;
        case "Order delivered":
            console.log(`The order ${event.orderId} has been delivered to the user ${event.user}`);
            break;
        default:
            console.log(`The event ${event.title} has been triggered, but is not recognized.`)
            break;
    }
}