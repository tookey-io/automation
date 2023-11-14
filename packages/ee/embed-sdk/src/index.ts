export enum ActivepiecesClientEventName {
  CLIENT_INIT = 'CLIENT_INIT',
  CLIENT_ROUTE_CHANGED = 'CLIENT_ROUTE_CHANGED',
}

export interface ActivepiecesClientInit {
  type: ActivepiecesClientEventName.CLIENT_INIT;
}

export interface ActivepiecesClientRouteChanged {
  type: ActivepiecesClientEventName.CLIENT_ROUTE_CHANGED;
  data: {
    route: string;
  };
}

export type ActivepiecesClientEvent =
  | ActivepiecesClientInit
  | ActivepiecesClientRouteChanged;

export enum ActivepiecesVendorEventName {
  VENDOR_INIT = 'VENDOR_INIT',
  VENDOR_ROUTE_CHANGED = 'VENDOR_ROUTE_CHANGED',
}

export interface ActivepiecesVendorRouteChanged {
  type: ActivepiecesVendorEventName.VENDOR_ROUTE_CHANGED;
  data: {
    vendorRoute: string;
  };
}

export interface ActivepiecesVendorInit {
  type: ActivepiecesVendorEventName.VENDOR_INIT;
  data: {
    prefix: string;
    initialRoute: string;
    hideSidebar:boolean
  };
}
export const jwtTokenQueryParamName = "jwtToken"


class ActivepiecesEmbedded {
  _prefix = '';
  _initialRoute = '';
  _hideSidebar=false;
  iframeParentOrigin = window.location.origin;
  handleVendorNavigation?: (data: { route: string }) => void;
  handleClientNavigation?: (data: { route: string }) => void;
  parentOrigin = window.location.origin;
  configure({
    prefix,
    initialRoute,
    hideSidebar
  }: {
    prefix?: string;
    initialRoute?: string;
    hideSidebar?:boolean
  }) {
    this._prefix = prefix || '/';
    this._initialRoute = initialRoute || '/';
    this._hideSidebar= hideSidebar || false;
    setIframeChecker(this);
  }
}

const setIframeChecker = (client: ActivepiecesEmbedded) => {
  const iframeChecker = setInterval(() => {
    const iframe = document.querySelector('iframe') as HTMLIFrameElement;
    const iframeWindow = iframe?.contentWindow;
    if (!iframeWindow) return;

    window.addEventListener(
      'message',
      function (event: MessageEvent<ActivepiecesClientEvent>) {
        if (event.source === iframeWindow) {
          switch (event.data.type) {
            case ActivepiecesClientEventName.CLIENT_INIT: {
              const apEvent: ActivepiecesVendorInit = {
                type: ActivepiecesVendorEventName.VENDOR_INIT,
                data: {
                  prefix: client._prefix,
                  initialRoute: client._initialRoute,
                  hideSidebar : client._hideSidebar
                },
              };
              iframeWindow.postMessage(apEvent, '*');
              break;
            }
          }
        }
      }
    );
    checkForVendorRouteChanges(iframeWindow, client);
    checkForClientRouteChanges(client);
    clearInterval(iframeChecker);
  });
};

const checkForClientRouteChanges = (client: ActivepiecesEmbedded) => {
  window.addEventListener(
    'message',
    function (event: MessageEvent<ActivepiecesClientRouteChanged>) {
      if (
        event.data.type === ActivepiecesClientEventName.CLIENT_ROUTE_CHANGED
      ) {
        if (!client.handleClientNavigation) {
          this.history.replaceState({}, '', event.data.data.route);
        } else {
          client.handleClientNavigation({ route: event.data.data.route });
        }
      }
    }
  );
};

const checkForVendorRouteChanges = (
  iframeWindow: Window,
  client: ActivepiecesEmbedded
) => {
  let currentRoute = window.location.href;
  setInterval(() => {
    if (currentRoute !== window.location.href) {
      currentRoute = window.location.href;
      if (client.handleVendorNavigation) {
        client.handleVendorNavigation({ route: currentRoute });
      }
      const prefixStartsWithSlash = client._prefix.startsWith('/');
      const apEvent: ActivepiecesVendorRouteChanged = {
        type: ActivepiecesVendorEventName.VENDOR_ROUTE_CHANGED,
        data: {
          vendorRoute: extractRouteAfterPrefix(
            currentRoute,
            prefixStartsWithSlash
              ? client.parentOrigin + client._prefix
              : `${client.parentOrigin}/${client._prefix}`
          ),
        },
      };
      iframeWindow.postMessage(apEvent, '*');
    }
  }, 50);
};

function extractRouteAfterPrefix(href: string, prefix: string) {
  return href.split(prefix)[1];
}

(window as any).activepieces = new ActivepiecesEmbedded();
