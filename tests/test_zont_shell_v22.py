from __future__ import annotations

import hashlib
import json
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
FRONTEND = ROOT / "custom_components" / "zont_local" / "frontend"


class ZontShellV22Tests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.profile = json.loads(
            (ROOT / ".nikas-ui-standard.json").read_text(encoding="utf-8")
        )
        cls.source_kit = (FRONTEND / "nikas-specialized-shell.js").read_text(
            encoding="utf-8"
        )
        cls.runtime = (FRONTEND / "zont-app.js").read_text(encoding="utf-8")
        cls.bundle = (FRONTEND / "zont-ui.js").read_text(encoding="utf-8")

    def test_vendored_source_kit_is_hash_pinned_and_bundled_first(self) -> None:
        digest = hashlib.sha256(self.source_kit.encode("utf-8")).hexdigest()
        self.assertEqual(
            digest,
            "c7171560b68e2c4118b327c5e6a63c65e3410a4e1f10a02691e0d15560166e65",
        )
        self.assertEqual(self.profile["source_kit"]["sha256"], digest)
        shell_marker = (
            "// BEGIN custom_components/zont_local/frontend/nikas-specialized-shell.js"
        )
        runtime_marker = "// BEGIN custom_components/zont_local/frontend/zont-app.js"
        self.assertLess(self.bundle.index(shell_marker), self.bundle.index(runtime_marker))

    def test_runtime_uses_the_canonical_host_bound_shell(self) -> None:
        for class_name in (
            "nikas-shell",
            "nikas-shell__header",
            "nikas-shell__title",
            "nikas-shell__viewport",
            "nikas-shell__canvas",
            "nikas-shell__content",
            "nikas-shell__tabs",
            "nikas-shell__tab",
        ):
            self.assertIn(class_name, self.runtime)
        self.assertIn("${nikasShellV2Styles()}", self.runtime)
        for forbidden in ("position:fixed", "100vh", "100dvh", "100vw"):
            self.assertNotIn(forbidden, self.runtime)

    def test_shell_rows_content_frame_and_five_tabs_match_contract(self) -> None:
        shell = self.profile["shell_contract"]
        self.assertEqual(shell["header_body_px"], 60)
        self.assertEqual(shell["bottom_nav_body_px"], 64)
        self.assertEqual(shell["content_max_width_px"], 1280)
        self.assertEqual(shell["specialized_tab_range"], [3, 5])
        self.assertIn("--nikas-shell-tab-count:5", self.runtime)
        self.assertIn("--mdc-icon-size:26px", self.source_kit)
        self.assertIn("line-height:14px", self.source_kit)

    def test_complete_viewport_matrix_is_declared(self) -> None:
        self.assertEqual(
            self.profile["shell_contract"]["viewport_matrix"],
            {
                "phone_portrait": "430x932",
                "phone_landscape": "932x430",
                "tablet_portrait": "768x1024",
                "tablet_landscape": "1024x768",
                "desktop": "1440x900",
            },
        )

    def test_host_guard_is_wired_and_cleaned_up(self) -> None:
        self.assertIn(
            "createNikasShellScrollBoundaryGuard({ host: this, viewport })",
            self.runtime,
        )
        self.assertIn("this.__zontBoundaryCleanupV095?.()", self.runtime)
        self.assertIn(
            'host.addEventListener("touchmove", moveTouch, { passive: false, capture: true })',
            self.source_kit,
        )
        self.assertIn("event.touches.length !== 1", self.source_kit)

    def test_boilers_and_dhw_stay_in_one_top_row(self) -> None:
        grid = self.runtime.index('<div class="z82-equipment-grid">')
        boiler_one = self.runtime.index('boilerCard(1, "основной + ГВС"', grid)
        boiler_two = self.runtime.index('boilerCard(2, "резервный"', grid)
        dhw = self.runtime.index("${dhwCard}", grid)
        self.assertLess(grid, boiler_one)
        self.assertLess(boiler_one, boiler_two)
        self.assertLess(boiler_two, dhw)
        self.assertIn(
            "grid-template-columns:minmax(0,.92fr) minmax(0,.92fr) minmax(0,1.16fr)!important",
            self.runtime,
        )
        self.assertIn(".z82-dhw-card{grid-column:auto!important}", self.runtime)

    def test_connection_indicator_uses_stable_two_line_geometry(self) -> None:
        self.assertIn("min-block-size:58px!important", self.runtime)
        self.assertIn("grid-template-columns:10px minmax(0,1fr)!important", self.runtime)
        self.assertIn("inline-size:10px!important", self.runtime)
        self.assertIn('role="status"', self.runtime)

    def test_single_controller_does_not_render_a_peer_selector(self) -> None:
        self.assertFalse(self.profile["peer_device_selector"]["enabled"])
        self.assertNotIn("nikas-shell--with-peer", self.runtime)
        self.assertNotIn("nikas-shell__peer", self.runtime)


if __name__ == "__main__":
    unittest.main()
