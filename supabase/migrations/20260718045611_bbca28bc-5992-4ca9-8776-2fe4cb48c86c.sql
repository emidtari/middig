
GRANT SELECT ON public.sites TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sites TO authenticated;
GRANT ALL ON public.sites TO service_role;

GRANT SELECT ON public.categories TO anon;
GRANT SELECT ON public.categories TO authenticated;
GRANT ALL ON public.categories TO service_role;

GRANT SELECT ON public.tags TO anon;
GRANT SELECT ON public.tags TO authenticated;
GRANT ALL ON public.tags TO service_role;

GRANT SELECT ON public.site_categories TO anon;
GRANT SELECT, INSERT, DELETE ON public.site_categories TO authenticated;
GRANT ALL ON public.site_categories TO service_role;

GRANT SELECT ON public.site_tags TO anon;
GRANT SELECT, INSERT, DELETE ON public.site_tags TO authenticated;
GRANT ALL ON public.site_tags TO service_role;

GRANT SELECT ON public.site_settings TO anon;
GRANT SELECT ON public.site_settings TO authenticated;
GRANT ALL ON public.site_settings TO service_role;

GRANT SELECT ON public.contact_info TO anon;
GRANT SELECT ON public.contact_info TO authenticated;
GRANT ALL ON public.contact_info TO service_role;

GRANT INSERT ON public.contact_messages TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contact_messages TO authenticated;
GRANT ALL ON public.contact_messages TO service_role;

GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

GRANT SELECT, INSERT ON public.payments TO authenticated;
GRANT ALL ON public.payments TO service_role;
