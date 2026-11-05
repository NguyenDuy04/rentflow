import * as kleur_colors from 'kleur/colors';

declare const highlighter: {
    error: typeof kleur_colors.print;
    warn: typeof kleur_colors.print;
    info: typeof kleur_colors.print;
    success: typeof kleur_colors.print;
};

export { highlighter };
