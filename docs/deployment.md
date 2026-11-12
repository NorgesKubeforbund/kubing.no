# Deployment of kubing.no on a NixOS system

## Sourcing the system

The system used for hosting kubing.no is the Lairon system as defined in
[`gitlab:ljfolde/nix-config#lairon`](https://gitlab.com/ljfolde/nix-config). If
the production environment needs to be moved to another machine the main
dependencies for running the system can be found under `modules/kubing` in the
flake repository.

## Building the system

The machine must be built with the SSH key required by `sops-nix` present on the
system. The secrets can be regenerated should the key be unavailable. The key
is managed by Lars Johan Folde. The sops key must be placed in
`~/.ssh/id_ed25519_nix` and `sops-nix` will find it automatically. 

Additionally if you are not in the real Lairon machine you must use the impure
version of the configuration. The only difference is that it sources
`hardware-configuration.nix` from `/etc/nixos/`. Ensure this file is correct and
up to date before building the system.

After the key and `hardware-configuration.nix` is present you can rebuild the system
using:

```
sudo nixos-rebuild --flake gitlab:ljfolde/nix-config#lairon-impure switch --impure
```

## Database import

All `docker compose` commands below must be run from the root of this
repository. The database user (`postgres`) and database name (`kubing`) must
match `POSTGRES_USER` and `POSTGRES_DB` in the production environment.

### Download from Jotta

Backups are made to Jottacloud on Norges Kubeforbund's account. Download the
latest successful backup from cloud storage.

### Restore the dump

Start the database container:

```
sudo docker compose -f compose.production.yaml up -d db
```

Import the backup into the database:

```
sudo docker compose -f compose.production.yaml exec -T db \
  pg_restore -U postgres -d kubing --clean --if-exists --no-owner < dump.dump
```

Leave the database running, as it is needed to verify the backups in the next
section.

## Configure Jottacloud backups

### Login

1. Generate a [Personal Login Token](https://www.jottacloud.com/web/secure) from
   the NKF Jottacloud account. Copy the key immediately, as it is only shown
   once.
2. Run `jotta-cli login`
3. Accept the terms and conditions
4. Paste the `Personal Login Token` you just generated

### Verify

Backups are run by a systemd service every 15 minutes. To test the backup
manually, run the script below and check that the dump appears in Jottacloud.
Afterwards, verify that the systemd service also runs as expected.

```
set -euo pipefail

ts=$(date +%F_%H-%M)
dir=$(date +%Y/%m/%d)

sudo docker compose -f compose.production.yaml exec -T db \
  pg_dump -U postgres -d kubing --exclude-table-data=sessions -h localhost -Fc \
| jotta-cli archive -I --remote="kubing_no_backup/$dir/kubing_no_backup_$ts.dump"
```

## Deploying the app

Pull the latest images, rebuild the app with updated base images and start all
services:

```
sudo docker compose -f compose.production.yaml pull
sudo docker compose -f compose.production.yaml build --pull
sudo docker compose -f compose.production.yaml up -d
```

The Docker configuration ensures the app starts when the machine boots.

The same commands are used to deploy new versions of the app.
