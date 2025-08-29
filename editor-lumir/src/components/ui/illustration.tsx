export const GettingStartedIllustration = () => {
  return (
    <div className='w-64 h-64 mx-auto'>
      <svg
        viewBox='0 0 256 256'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
        className='w-full h-full'>
        {/* 배경 원 */}
        <circle
          cx='128'
          cy='128'
          r='120'
          fill='#f3f4f6'
          stroke='#e5e7eb'
          strokeWidth='2'
        />

        {/* 종이 조각들 */}
        <g transform='translate(40, 60) rotate(15)'>
          <rect
            x='0'
            y='0'
            width='30'
            height='40'
            fill='#ffffff'
            stroke='#d1d5db'
            strokeWidth='1'
            rx='2'
          />
          <line
            x1='5'
            y1='10'
            x2='25'
            y2='10'
            stroke='#9ca3af'
            strokeWidth='1'
          />
          <line
            x1='5'
            y1='15'
            x2='20'
            y2='15'
            stroke='#9ca3af'
            strokeWidth='1'
          />
          <line
            x1='5'
            y1='20'
            x2='22'
            y2='20'
            stroke='#9ca3af'
            strokeWidth='1'
          />
        </g>

        <g transform='translate(180, 80) rotate(-10)'>
          <rect
            x='0'
            y='0'
            width='25'
            height='35'
            fill='#ffffff'
            stroke='#d1d5db'
            strokeWidth='1'
            rx='2'
          />
          <line x1='5' y1='8' x2='20' y2='8' stroke='#9ca3af' strokeWidth='1' />
          <line
            x1='5'
            y1='13'
            x2='18'
            y2='13'
            stroke='#9ca3af'
            strokeWidth='1'
          />
          <line
            x1='5'
            y1='18'
            x2='15'
            y2='18'
            stroke='#9ca3af'
            strokeWidth='1'
          />
        </g>

        <g transform='translate(50, 160) rotate(25)'>
          <rect
            x='0'
            y='0'
            width='35'
            height='45'
            fill='#ffffff'
            stroke='#d1d5db'
            strokeWidth='1'
            rx='2'
          />
          <line
            x1='5'
            y1='12'
            x2='30'
            y2='12'
            stroke='#9ca3af'
            strokeWidth='1'
          />
          <line
            x1='5'
            y1='18'
            x2='25'
            y2='18'
            stroke='#9ca3af'
            strokeWidth='1'
          />
          <line
            x1='5'
            y1='24'
            x2='28'
            y2='24'
            stroke='#9ca3af'
            strokeWidth='1'
          />
        </g>

        {/* 중앙 인물 */}
        <g transform='translate(128, 128)'>
          {/* 머리 */}
          <circle cx='0' cy='-20' r='15' fill='#6b7280' />

          {/* 몸통 */}
          <rect x='-12' y='-5' width='24' height='35' fill='#4b5563' rx='8' />

          {/* 팔 */}
          <rect
            x='-25'
            y='0'
            width='8'
            height='25'
            fill='#4b5563'
            rx='4'
            transform='rotate(-30)'
          />
          <rect
            x='17'
            y='0'
            width='8'
            height='25'
            fill='#4b5563'
            rx='4'
            transform='rotate(30)'
          />

          {/* 다리 */}
          <rect x='-8' y='30' width='6' height='20' fill='#4b5563' rx='3' />
          <rect x='2' y='30' width='6' height='20' fill='#4b5563' rx='3' />

          {/* 아이디어 표시 */}
          <circle cx='-40' cy='-30' r='8' fill='#fbbf24' opacity='0.8' />
          <circle cx='40' cy='-40' r='6' fill='#fbbf24' opacity='0.6' />
          <circle cx='-35' cy='-50' r='5' fill='#fbbf24' opacity='0.7' />
        </g>

        {/* 떠다니는 아이디어들 */}
        <g>
          <circle cx='60' cy='60' r='4' fill='#fbbf24' opacity='0.5' />
          <circle cx='200' cy='70' r='3' fill='#fbbf24' opacity='0.4' />
          <circle cx='70' cy='180' r='5' fill='#fbbf24' opacity='0.6' />
          <circle cx='190' cy='190' r='4' fill='#fbbf24' opacity='0.5' />
        </g>
      </svg>
    </div>
  );
};
