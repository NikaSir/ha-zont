"""Verify documentation against central authority; no network or dependencies.

Authority: NikaSir/ha-contract-generated-ui at
88c02f69712ff13d2f306d1cc679a3af1485201e.
This checks documentation parity, not runtime or device acceptance.
"""
import hashlib
import json
from pathlib import Path

EXPECTED = {'standard': '6ef10e3bc8a98de92d4ff3d6b67c08c8a2b955accf67a4a97c3d101fdab1561f', 'navigation_contract': '26269e700cffa7cc1b0a2f93ff6314ed3d366f988460168c312324511f282423'}
VERSIONS = {'version': '2.2', 'navigation_contract_version': '1.3'}

def validate(root):
    errors = []
    try:
        declaration = json.loads((root / '.nikas-ui-standard.json').read_text())
        if not isinstance(declaration, dict):
            return ['standard declaration must be an object']
        for key, version in VERSIONS.items():
            if declaration.get(key) != version:
                errors.append(f'{key}: expected {version}')
        for key, expected in EXPECTED.items():
            if declaration.get(key + '_sha256') != expected:
                errors.append(f'{key}: declaration differs from pinned authority')
            path = declaration.get(key + '_path')
            if not isinstance(path, str) or not path:
                errors.append(f'{key}: missing document path')
                continue
            target = (root / path).resolve()
            if not target.is_relative_to(root.resolve()):
                errors.append(f'{key}: document must be inside repository')
                continue
            try:
                actual = hashlib.sha256(target.read_bytes()).hexdigest()
            except OSError as error:
                errors.append(f'{key}: {error}')
                continue
            if actual != expected:
                errors.append(f'{key}: document differs from pinned authority')
    except (OSError, ValueError) as error:
        errors.append(str(error))
    return errors

if __name__ == '__main__':
    errors = validate(Path(__file__).resolve().parents[1])
    if errors:
        raise SystemExit('\n'.join(errors))
    print('Standard documents match pinned central authority (device acceptance unchanged).')
