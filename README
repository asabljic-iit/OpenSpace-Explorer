# OpenSpace Explorer

OpenSpace Explorer is an interactive astronomy exhibit built on [OpenSpace](https://openspaceproject.com/). It was created during the 2026 Summer Space Visualization Lab internship at the Adler Planetarium by Vanessa Garcia and Amir Sabljic as a replacement for the WorldWide Telescope exhibit.

The project combines OpenSpace assets and Lua actions with a browser-based tablet interface. Guests can explore the Solar System, constellations, deep-sky images, asteroids, satellites, ground-based telescopes, space telescopes, and a lunar tardigrade easter egg.

## Requirements

- Windows with OpenSpace installed. The project was tested with OpenSpace v0.22.0 at `C:\OpenSpace-v.0.22.0`.
- The [OSBaseDefault](https://github.com/asabljic-adler/OSBaseDefault) assets installed in OpenSpace's `user\data\assets` directory.
- Git and [Git LFS](https://git-lfs.com/). The repository stores large 3D models and images with LFS.
- Node.js for the web server. A Windows installer is included in `WWT\web`.

## Installation

Open Command Prompt and run the following commands:

```bat
winget install GitHub.GitLFS

git lfs install

git clone https://github.com/asabljic-adler/OpenSpace-Explorer.git

cd OpenSpace-Explorer

git lfs pull
```

The following commands create links from the OpenSpace installation to this repository. Replace `C:\OpenSpace-v.0.22.0` if OpenSpace is installed elsewhere.

```bat
mklink /J "C:\OpenSpace-v.0.22.0\user\data\assets\WWT" "%cd%\WWT"

mklink /H "C:\OpenSpace-v.0.22.0\user\data\profiles\WWT_Replacement.profile" "%cd%\WWT_Replacement.profile"

mklink /H "C:\OpenSpace-v.0.22.0\user\config\WWT_Fullscreen.json" "%cd%\WWT_Fullscreen.json"
```

If these paths already exist, move or back them up before creating the links. The links let you update the repository without copying the asset, profile, and configuration files manually.

## Running OpenSpace

1. Go to the `user\data\assets\WWT\web` directory within OpenSpace.
2. Install Node.js with the provided `.msi` installer if you want to use the tablet interface. Skip the optional additional tools during installation.
3. Run `start-all.bat`.

`start-all.bat` starts OpenSpace and the web server. The web page may reload while OpenSpace initializes. Once initialization is complete, the interface will connect to OpenSpace. The web server terminal prints the address to open, normally:

```text
http://<computer-ip>:5000
```

For a tablet, connect the tablet and the OpenSpace computer to the same Wi-Fi network, then open the printed address in the browser.

## Documentation

For additional help or information, please see the [documentation](https://docs.google.com/document/d/15wQMbgPBKr9iLeaMPDeE9aorBFuUy_XuasAho-uGB44/edit?usp=drive_link).

## Credits and License

Created by Vanessa Garcia and Amir Sabljic during the 2026 Summer Space Visualization Lab internship at the Adler Planetarium. Released under the [MIT License](LICENSE).