# To learn more about how to use Nix to configure your environment
# see: https://firebase.google.com/docs/studio/customize-workspace
{pkgs}: {
  # Which nixpkgs channel to use.
  channel = "stable-24.11"; # or "unstable"
  # Use https://search.nixos.org/packages to find packages
  packages = [
    pkgs.nodejs_20
    pkgs.zulu
    pkgs.openssl.bin
  ];
  # Sets environment variables in the workspace
  env = {};
  # This adds a file watcher to startup the firebase emulators. The emulators will only start if
  # a firebase.json file is written into the user's directory
  services.firebase.emulators = {
    # Disabling because we are using prod backends right now
    detect = false;
    projectId = "demo-app";
    services = ["auth" "firestore"];
  };
  idx = {
    # Search for the extensions you want on https://open-vsx.org/ and use "publisher.id"
    extensions = [
      # --- Essentials ---
      "ms-ceintl.vscode-language-pack-en-us"
      "eclipse.typescript-language-features"
      "vscode.git"
      "vscode.github"
      "esbenp.prettier-vscode"

      # --- React / Next.js / TS ---
      "dbaeumer.vscode-eslint"
      "xabikos.javascriptsnippets"
      "dsznajder.es7-react-js-snippets"
      "bradlc.vscode-tailwindcss"

      # --- Prisma ---
      "prisma.prisma"

      # --- Supabase (SQL, PostgreSQL) ---
      "mtxr.sqltools"
      "mtxr.sqltools-driver-pg"

      # --- REST / API Testing ---
      "humao.rest-client"

      # --- Git & Diff Tools ---
      "mhutchie.git-graph"
      "aaron-bond.better-comments"

      # --- Docker (optional but recommended for DB testing) ---
      "ms-azuretools.vscode-docker"

      # --- Icons ---
      "vscode-icons-team.vscode-icons"

      # --- Firebase Tools ---
      "firebase.firebase-explorer"

      # --- Nix language support ---
      "jnoortheen.nix-ide"
];

    workspace = {
      onCreate = {
        default.openFiles = [
          "src/app/page.tsx"
        ];
      };
    };
    # Enable previews and customize configuration
    previews = {
      enable = true;
      previews = {
        web = {
          command = ["npm" "run" "dev" "--" "--port" "$PORT" "--hostname" "0.0.0.0"];
          manager = "web";
        };
      };
    };
  };
}
