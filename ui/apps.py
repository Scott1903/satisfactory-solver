import logging

from django.apps import AppConfig

logger = logging.getLogger(__name__)

class UiConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'ui'

    def ready(self):
        from django.db.models.signals import post_migrate

        def seed_default_settings(sender, **kwargs):
            from django.db.utils import OperationalError, ProgrammingError
            from .models import DefaultSettings
            import json
            import os

            try:
                if DefaultSettings.objects.exists():
                    return

                base_dir = os.path.dirname(os.path.abspath(__file__))
                default_path = os.path.join(base_dir, 'data', 'default.json')
                if os.path.exists(default_path):
                    with open(default_path, 'r', encoding='utf-8') as f:
                        raw = json.load(f)
                    DefaultSettings.objects.create(
                        resource_limits=raw.get("resource_limits", {}),
                        weights=raw.get("weights", {}),
                        recipes_off=raw.get("recipes_off", []),
                        inputs=raw.get("inputs", {}),
                        outputs=raw.get("outputs", {}),
                        max_item=raw.get("max_item") or None,
                        checkbox_Nuclear_Waste=raw.get("checkbox_Nuclear Waste", False),
                    )
                else:
                    logger.warning(
                        "ui: default settings seed skipped; expected file missing: %s",
                        default_path,
                    )
            except (OperationalError, ProgrammingError):
                # Database not ready yet (migrations incomplete)
                pass

        post_migrate.connect(seed_default_settings, sender=self, dispatch_uid="ui.seed_default_settings")
