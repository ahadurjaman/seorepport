import React from 'react';
import { getAdNetworkEndpoint } from '../../utils/adConfig';

interface AdsterraBannerProps {
  className?: string;
}

export const AdsterraBanner: React.FC<AdsterraBannerProps> = ({ className = '' }) => {
  const scriptUrl = getAdNetworkEndpoint('banner728');
  const iframeContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      background: transparent;
      overflow: hidden;
      width: 100%;
      height: 100%;
    }
  </style>
</head>
<body>
  <script type="text/javascript">
    atOptions = {
      'key' : '2a67d3757d5aa14f331fe2832585e789',
      'format' : 'iframe',
      'height' : 90,
      'width' : 728,
      'params' : {}
    };
  </script>
  <script type="text/javascript" src="${scriptUrl}"></script>
</body>
</html>`;

  return (
    <div className={`w-full flex flex-col items-center justify-center overflow-x-auto py-1 ${className}`}>
      <div className="w-full max-w-[728px] min-h-[90px] flex items-center justify-center overflow-hidden">
        <iframe
          title="Sponsored Advertisement"
          srcDoc={iframeContent}
          width="728"
          height="90"
          className="max-w-full border-0 overflow-hidden"
          scrolling="no"
          loading="lazy"
          sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation"
        />
      </div>
    </div>
  );
};
