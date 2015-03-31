/**
 * Created with IntelliJ IDEA.
 * User: Caleb
 * Date: 10/30/13
 * Time: 8:03 PM
 * To change this template use File | Settings | File Templates.
 */



// setup message listener
chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {

        // todo stuff to handle messages recieved - for now nothin'

        localStorage.setItem('woah', request);
    });