export const BASE_URL = 'http://192.168.1.107:8000/api/v1'; //local
// export const BASE_URL = 'http://13.203.156.169:8000/api/v1';  //aws

export const BACKEND_URL = 'http://192.168.1.107:8000';
// export const BACKEND_URL = 'http://13.203.156.169:8000';  //aws

export const STEAM_API_KEY = 'jdxc5xkrtqfs';

export const IMAGE_FILTERS = [
  {
    id: 'normal',
    name: 'Normal',
    icon: 'circle',
    matrix: [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0],
  },
  {
    id: 'cairo',
    name: 'Cairo',
    icon: 'layers',
    matrix: [
      1.1, 0.15, 0.0, 0, 0.05, 0.1, 1.0, 0.0, 0, 0.03, -0.1, -0.05, 0.8, 0,
      0.01, 0, 0, 0, 1, 0,
    ],
  },
  {
    id: 'tokyo',
    name: 'Tokyo',
    icon: 'aperture',
    matrix: [
      0.9, 0.2, 0.0, 0, -0.04, 0.0, 1.1, 0.3, 0, 0.02, 0.2, 0.0, 1.3, 0, 0.06,
      0, 0, 0, 1, 0,
    ],
  },
  {
  id: 'matrix',
  name: 'Matrix',
  icon: 'terminal',
  matrix: [
    0.3, 0.7, 0.0, 0, 0.0,
    0.2, 1.2, 0.0, 0, 0.0,
    0.1, 0.5, 0.2, 0, 0.0,
    0, 0, 0, 1, 0,
  ],
},
{
  id: 'bubblegum',
  name: 'Bubblegum',
  icon: 'heart',
  matrix: [
    1.2, 0.1, 0.1, 0, 0.1,
    0.05, 1.0, 0.1, 0, 0.08,
    0.1, 0.15, 1.0, 0, 0.05,
    0, 0, 0, 1, 0,
  ],
},
  {
  id: 'noir',
  name: 'Film Noir',
  icon: 'film',
  matrix: [
    0.4, 0.4, 0.2, 0, 0.0,
    0.3, 0.5, 0.2, 0, 0.0,
    0.3, 0.3, 0.4, 0, 0.0,
    0, 0, 0, 1, 0,
  ],
},
  
  {
  id: 'jakarta',
  name: 'Jakarta',
  icon: 'moon',
  matrix: [
    1.2, 0.1, 0.0, 0, 0.05,  // Red channel - enhanced with slight green tint
    0.05, 1.1, 0.1, 0, 0.02, // Green channel - slightly boosted
    0.0, 0.05, 0.8, 0, 0.15, // Blue channel - reduced for warmth
    0, 0, 0, 1, 0,            // Alpha channel - unchanged
  ],
},

// Fixed Lo-fi Filter - Vintage, desaturated look
{
  id: 'lofi',
  name: 'Lo-fi',
  icon: 'git-merge',
  matrix: [
    0.8, 0.15, 0.1, 0, 0.08,  // Red channel - muted with cross-channel bleeding
    0.1, 0.7, 0.15, 0, 0.06,  // Green channel - desaturated
    0.05, 0.1, 0.6, 0, 0.12,  // Blue channel - heavily reduced
    0, 0, 0, 1, 0,             // Alpha channel - unchanged
  ],
},
  {
    id: 'grayscale',
    name: 'Graphite',
    icon: 'moon',
    matrix: [
      0.299, 0.587, 0.114, 0, 0, 0.299, 0.587, 0.114, 0, 0, 0.299, 0.587, 0.114,
      0, 0, 0, 0, 0, 1, 0,
    ],
  },
  {
    id: 'retro_vhs',
    name: 'Retro VHS',
    icon: 'rotate-ccw',
    matrix: [
      1.1,
      0.3,
      -0.2,
      0,
      0.1, // Red bleed
      -0.1,
      0.9,
      0.4,
      0,
      -0.05, // Green noise
      0.2,
      -0.1,
      0.8,
      0,
      0.15, // Blue haze
      0,
      0,
      0,
      1,
      0,
    ],
  },
  {
    id: 'cool',
    name: 'Cool',
    icon: 'wind',
    matrix: [
      0.8, 0, 0.2, 0, 0, 0, 0.9, 0.1, 0, 0, 0, 0, 1.2, 0, 0, 0, 0, 0, 1, 0,
    ],
  },
  {
  id: 'forest',
  name: 'Forest Mood',
  icon: 'chevrons-up',
  matrix: [
    0.8, 0.2, 0.0, 0, 0.02,
    0.1, 1.3, 0.1, 0, 0.0,
    0.0, 0.2, 0.9, 0, 0.05,
    0, 0, 0, 1, 0,
  ],
},
  {
    id: 'juno',
    name: 'Juno',
    icon: 'sunrise',
    matrix: [
      1.1, 0.0, 0.0, 0, 0.0196, 0.0, 1.0, 0.0, 0, 0, 0.0, 0.0, 0.9, 0, -0.0392,
      0, 0, 0, 1, 0,
    ],
  },
  {
    id: 'dramatic',
    name: 'Drama',
    icon: 'zap',
    matrix: [1.5, 0, 0, 0, 0, 0, 1.5, 0, 0, 0, 0, 0, 1.5, 0, 0, 0, 0, 0, 1, 0],
  },
  {
    id: 'cinematic',
    name: 'Cinema',
    icon: 'film',
    matrix: [
      1.2, -0.05, -0.1, 0, 0, -0.1, 1.1, -0.1, 0, 0, -0.05, 0.05, 1.3, 0, 0, 0,
      0, 0, 1, 0,
    ],
  },
  {
    id: 'jaipur',
    name: 'Jaipur',
    icon: 'loader',
    matrix: [
      1.3, -0.1, 0.2, 0, 0.06, 0.1, 0.9, 0.1, 0, 0.04, 0.0, 0.2, 0.85, 0, 0.02,
      0, 0, 0, 1, 0,
    ],
  },
  {
    id: 'soft',
    name: 'Soft',
    icon: 'feather',
    matrix: [
      0.95, 0.05, 0.05, 0, 0.01176, 0.05, 0.95, 0.05, 0, 0.01176, 0.05, 0.05,
      0.95, 0, 0.01176, 0, 0, 0, 1, 0,
    ],
  },
  {
    id: 'tealOrange',
    name: 'Teal & Orange',
    icon: 'target',
    matrix: [
      1.2, -0.1, -0.1, 0, 0, -0.05, 1.05, -0.1, 0, 0, -0.2, 0.2, 1.0, 0, 0.02,
      0, 0, 0, 1, 0,
    ],
  },
  {
    id: 'arctic_frost',
    name: 'Arctic Frost',
    icon: 'cloud-snow',
    matrix: [
      0.7,
      0.2,
      0.4,
      0,
      0.3, // Ice blue tint
      0.1,
      0.8,
      0.3,
      0,
      0.25, // Cyan highlights
      0.5,
      0.3,
      1.2,
      0,
      0.4, // Frostburn whites
      0,
      0,
      0,
      1,
      0,
    ],
  },
  {
    id: 'moody',
    name: 'Moody',
    icon: 'cloud',
    matrix: [
      1.1, 0, 0, 0, -0.0196, 0, 1.1, 0, 0, -0.0196, 0, 0, 1.1, 0, -0.0196, 0, 0,
      0, 1, 0,
    ],
  },
  {
    id: 'pastel',
    name: 'Pastel',
    icon: 'droplet',
    matrix: [
      1.05, 0, 0, 0, 0.0235, 0, 1.02, 0, 0, 0.0235, 0, 0, 1.0, 0, 0.0235, 0, 0,
      0, 1, 0,
    ],
  },
  {
    id: 'matte',
    name: 'Matte',
    icon: 'square',
    matrix: [
      0.8, 0, 0, 0, 0.0784, 0, 0.8, 0, 0, 0.0784, 0, 0, 0.8, 0, 0.0784, 0, 0, 0,
      1, 0,
    ],
  },
  {
    id: 'fade',
    name: 'Fade',
    icon: 'trending-down',
    matrix: [
      0.9, 0.05, 0.05, 0, 0, 0.05, 0.9, 0.05, 0, 0, 0.05, 0.05, 0.9, 0, 0, 0, 0,
      0, 1, 0,
    ],
  },
  {
    id: 'clarendon',
    name: 'Clarendon',
    icon: 'command',
    matrix: [
      1.2, 0.0, 0.0, 0, -0.0392, 0.0, 1.1, 0.0, 0, -0.0196, 0.0, 0.0, 1.0, 0,
      0.0196, 0, 0, 0, 1, 0,
    ],
  },
  {
    id: 'warm',
    name: 'Warm',
    icon: 'thermometer',
    matrix: [
      1.2, 0, 0, 0, 0.1, 0, 1.0, 0, 0, 0.05, 0, 0, 0.8, 0, 0, 0, 0, 0, 1, 0,
    ],
  },
  {
    id: 'gingham',
    name: 'Gingham',
    icon: 'grid',
    matrix: [
      0.9, 0.0, 0.0, 0, 0.0392, 0.0, 0.95, 0.0, 0, 0.0196, 0.0, 0.0, 0.85, 0,
      0.0196, 0, 0, 0, 1, 0,
    ],
  },
  {
    id: 'moon',
    name: 'Moon',
    icon: 'moon',
    matrix: [
      0.8, 0.0, 0.0, 0, 0.0784, 0.0, 0.8, 0.2, 0, 0.0392, 0.0, 0.1, 0.9, 0,
      0.0784, 0, 0, 0, 1, 0,
    ],
  },

  {
    id: 'buenos_aires',
    name: 'Buenos',
    icon: 'globe',
    matrix: [
      1.15, 0.05, -0.05, 0, 0.03, 0.05, 1.05, 0.0, 0, 0.02, -0.1, 0.0, 0.95, 0,
      -0.01, 0, 0, 0, 1, 0,
    ],
  },
  {
    id: 'vintage',
    name: 'Vintage',
    icon: 'camera',
    matrix: [
      0.6, 0.3, 0.1, 0, 0, 0.2, 0.7, 0.1, 0, 0, 0.1, 0.2, 0.7, 0, 0, 0, 0, 0, 1,
      0,
    ],
  },
  {
    id: 'sepia',
    name: 'Sepia',
    icon: 'sun',
    matrix: [
      0.393, 0.769, 0.189, 0, 0, 0.349, 0.686, 0.168, 0, 0, 0.272, 0.534, 0.131,
      0, 0, 0, 0, 0, 1, 0,
    ],
  },
  {
    id: 'cyber_hologram',
    name: 'Hologram',
    icon: 'video',
    matrix: [
      0.4,
      1.2,
      0.0,
      0,
      -0.1, // Cyan channel overload
      1.1,
      0.3,
      0.9,
      0,
      0.15, // Magenta interference
      0.0,
      0.8,
      0.5,
      0,
      0.2, // Green scanlines
      0,
      0,
      0,
      1,
      0,
    ],
  },
  {
    id: 'inverted',
    name: 'Inverted',
    icon: 'refresh-ccw',
    matrix: [-1, 0, 0, 0, 1, 0, -1, 0, 0, 1, 0, 0, -1, 0, 1, 0, 0, 0, 1, 0],
  },
  {
    id: 'new_york',
    name: 'New York',
    icon: 'map-pin',
    matrix: [
      1.2, 0.0, 0.1, 0, -0.05, 0.0, 0.95, 0.0, 0, -0.03, 0.1, 0.0, 1.1, 0, 0.04,
      0, 0, 0, 1, 0,
    ],
  },
];
