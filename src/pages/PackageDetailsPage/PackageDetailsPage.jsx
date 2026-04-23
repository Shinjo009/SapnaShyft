import React, { useEffect, useMemo, useRef, useState, Suspense, lazy } from 'react';
import './PackageDetailsPage.css';
import { getDiagnosticPackageDetail } from '../../services/diagnosticPackagesService';

// PatientSelectionOverlay is only mounted when user opens the booking sheet — defer its ~14 KiB chunk.
const PatientSelectionOverlay = lazy(() => import('../../components/PatientSelectionOverlay'));

const TABS = [
  { key: 'home', label: 'Home' },
  { key: 'about', label: 'About' },
  { key: 'why', label: 'Why' },
  { key: 'parameters', label: 'Parameters' },
  { key: 'samples', label: 'Samples' },
  { key: 'preparation', label: 'Preparation' },
  { key: 'faq', label: "FAQ's" },
];

const HomeTabIconInactive = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M2.6684 13.4855H5.33507V9.422C5.33507 9.19174 5.4204 8.99886 5.59107 8.84336C5.76173 8.68787 5.9727 8.60985 6.22396 8.60931H9.77951C10.0314 8.60931 10.2426 8.68732 10.4133 8.84336C10.584 8.9994 10.669 9.19228 10.6684 9.422V13.4855H13.3351V6.17121L8.00173 2.51407L2.6684 6.17121V13.4855ZM0.890625 13.4855V6.17121C0.890625 5.91386 0.953736 5.67005 1.07996 5.43978C1.20618 5.20952 1.38011 5.01989 1.60174 4.87089L6.93507 1.21375C7.24618 0.997032 7.60173 0.888672 8.00173 0.888672C8.40173 0.888672 8.75729 0.997032 9.0684 1.21375L14.4017 4.87089C14.624 5.01989 14.7982 5.20952 14.9244 5.43978C15.0506 5.67005 15.1134 5.91386 15.1128 6.17121V13.4855C15.1128 13.9325 14.9386 14.3153 14.5902 14.6338C14.2417 14.9524 13.8234 15.1114 13.3351 15.1109H9.77951C9.52766 15.1109 9.3167 15.0329 9.14662 14.8768C8.97655 14.7208 8.89122 14.5279 8.89062 14.2982V10.2347H7.11285V14.2982C7.11285 14.5285 7.02751 14.7216 6.85685 14.8776C6.68618 15.0337 6.47522 15.1114 6.22396 15.1109H2.6684C2.17951 15.1109 1.76114 14.9519 1.41329 14.6338C1.06544 14.3158 0.891218 13.933 0.890625 13.4855Z" fill="#999999"/>
  </svg>
);

const HomeTabIconActive = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M1.14453 13.29V6.23694C1.14453 5.98878 1.20539 5.75368 1.3271 5.53164C1.44882 5.3096 1.61653 5.12674 1.83025 4.98307L6.9731 1.45654C7.2731 1.24756 7.61596 1.14307 8.00167 1.14307C8.38739 1.14307 8.73024 1.24756 9.03024 1.45654L14.1731 4.98307C14.3874 5.12674 14.5554 5.3096 14.6771 5.53164C14.7988 5.75368 14.8594 5.98878 14.8588 6.23694V13.29C14.8588 13.721 14.6908 14.0901 14.3548 14.3973C14.0188 14.7045 13.6154 14.8579 13.1445 14.8573H10.5731C10.3302 14.8573 10.1268 14.7821 9.96282 14.6317C9.79882 14.4812 9.71653 14.2952 9.71596 14.0737V10.1553C9.71596 9.93327 9.63367 9.74728 9.4691 9.59733C9.30453 9.44739 9.1011 9.37216 8.85882 9.37164H7.14453C6.90167 9.37164 6.69824 9.44687 6.53424 9.59733C6.37024 9.7478 6.28796 9.93379 6.28739 10.1553V14.0737C6.28739 14.2957 6.2051 14.482 6.04053 14.6324C5.87596 14.7829 5.67253 14.8579 5.43024 14.8573H2.85882C2.38739 14.8573 1.98396 14.704 1.64853 14.3973C1.3131 14.0907 1.1451 13.7215 1.14453 13.29Z" fill="white"/>
  </svg>
);

const DETAIL_CARDS = [
  {
    id: 'tests',
    small: 'Tests Included',
    big: '150 Parameters',
    variant: 'pink',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
        <path d="M15.7483 5.25L5.11333 15.885C4.28344 16.7057 2.9466 16.7024 2.12083 15.8775C1.29306 15.0488 1.29306 13.7062 2.12083 12.8775L12.7483 2.25M11.9983 1.5L16.4983 6M8.99833 12H2.99833" stroke="#CCCCCC" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    id: 'samples',
    small: 'Samples Needed',
    big: 'Blood & Urine',
    variant: 'green',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="16" viewBox="0 0 12 16" fill="none" aria-hidden="true">
        <path d="M6 15C8.89755 15 11.25 12.6476 11.25 9.75C11.25 8.25 10.5 6.825 9 5.625C7.5 4.425 6.375 2.625 6 0.75C5.625 2.625 4.5 4.425 3 5.625C1.5 6.825 0.75 8.25 0.75 9.75C0.75 12.6476 3.10245 15 6 15" stroke="#CCCCCC" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    id: 'prep',
    small: 'Preparation',
    big: '-',
    variant: 'blue',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
        <path d="M1.5 9C1.5 13.1394 4.86064 16.5 9 16.5C13.1394 16.5 16.5 13.1394 16.5 9C16.5 4.86064 13.1394 1.5 9 1.5C4.86064 1.5 1.5 4.86064 1.5 9V9" stroke="#CCCCCC" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M9 4.5V9L12 10.5" stroke="#CCCCCC" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
];

const ArrowIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="8" height="12" viewBox="0 0 8 12" fill="none" aria-hidden="true">
    <path d="M0.765298 10.7501L6.79252 5.74121L0.750564 0.750102" stroke="#CCCCCC" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const MetaGenderIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M1.33594 8.00016C1.33594 11.6796 4.32317 14.6668 8.0026 14.6668C11.682 14.6668 14.6693 11.6796 14.6693 8.00016C14.6693 4.32073 11.682 1.3335 8.0026 1.3335C4.32317 1.3335 1.33594 4.32073 1.33594 8.00016V8.00016" stroke="#9A9A9A" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M6 6.66699C6 7.77082 6.89617 8.66699 8 8.66699C9.10383 8.66699 10 7.77082 10 6.66699C10 5.56316 9.10383 4.66699 8 4.66699C6.89617 4.66699 6 5.56316 6 6.66699V6.66699" stroke="#9A9A9A" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M4.66797 13.7748V12.6668C4.66797 11.9309 5.26542 11.3335 6.0013 11.3335H10.0013C10.7372 11.3335 11.3346 11.9309 11.3346 12.6668V13.7748" stroke="#9A9A9A" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const MetaClockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <g clipPath="url(#clip0_2583_4715)">
      <path d="M14.3673 8.00016C14.3673 9.75686 13.6556 11.3503 12.5029 12.503L11.102 11.1022L10.449 10.6124L8 8.16343V4.40832V3.592V1.63281C11.5166 1.63281 14.3673 4.48359 14.3673 8.00016Z" fill="#9A9A9A"/>
      <path d="M12.5045 12.503C13.6572 11.3503 14.3689 9.75683 14.3689 8.00013C14.3689 4.48356 11.5182 1.63278 8.0016 1.63278C6.15993 1.63278 4.50112 2.41339 3.3388 3.66403C2.28078 4.8002 1.63425 6.32506 1.63425 8.00013C1.63425 9.71442 2.31346 11.2753 3.42044 12.4182C4.57622 13.6197 6.20248 14.3675 8.0016 14.3675C9.7583 14.3675 11.3517 13.6557 12.5045 12.503ZM8.0016 0.32666C12.2401 0.32666 15.6751 3.7616 15.6751 8.00013C15.6751 12.2387 12.2401 15.6736 8.0016 15.6736C3.76323 15.6736 0.328125 12.2387 0.328125 8.00013C0.328125 3.7616 3.76323 0.32666 8.0016 0.32666Z" fill="#9A9A9A"/>
      <path d="M8.00247 1.30615C7.05586 1.30615 6.14112 1.49956 5.28361 1.88098C4.45485 2.24963 3.72035 2.77469 3.10072 3.4414C1.94507 4.68241 1.30859 6.30139 1.30859 8.00003C1.30859 9.74514 1.9756 11.3948 3.18598 12.6444C3.8025 13.2854 4.5274 13.7895 5.34053 14.1428C6.18219 14.5085 7.0778 14.6939 8.00247 14.6939C9.79108 14.6939 11.4723 13.9978 12.7362 12.7338C14.0003 11.4698 14.6964 9.78863 14.6964 8.00003C14.6964 4.30903 11.6935 1.30615 8.00247 1.30615ZM3.88453 12.4165L4.96806 11.3329L4.50624 10.8712L3.43153 11.9459C2.55245 10.9334 2.04198 9.66893 1.9706 8.32656H3.59431V7.6735H1.9707C2.04019 6.37339 2.52361 5.14001 3.35506 4.14096L4.50628 5.29214L4.96806 4.83033L3.79891 3.66132C4.30957 3.16519 4.897 2.76767 5.54902 2.47765C6.22347 2.17763 6.93752 2.00669 7.67594 1.96783V3.59187H8.329V1.9681C9.78997 2.04633 11.1145 2.64617 12.1198 3.58413L10.8736 4.83033L11.3354 5.29214L12.5731 4.05446C13.4222 5.0367 13.9606 6.29443 14.0344 7.6735H12.4106V8.32656H14.0344C13.9613 9.70952 13.4246 11.0057 12.4991 12.0348L11.3354 10.8711L10.8736 11.333L12.0372 12.4966C11.0082 13.4222 9.71196 13.9589 8.329 14.032V12.4082H7.67594V14.0321C6.25135 13.9571 4.92554 13.3924 3.88453 12.4165Z" fill="#9A9A9A"/>
      <path d="M10.2204 10.8432L10.6822 10.3814L8.32884 8.02802V4.4082H7.67578V8.16331C7.67578 8.2499 7.7102 8.33294 7.77142 8.3942L10.2204 10.8432Z" fill="#9A9A9A"/>
    </g>
    <defs>
      <clipPath id="clip0_2583_4715">
        <rect width="16" height="16" fill="white"/>
      </clipPath>
    </defs>
  </svg>
);

const MetaPeopleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M10.6654 14.0001V12.6668C10.6654 11.195 9.47047 10.0001 7.9987 10.0001H3.9987C2.52692 10.0001 1.33203 11.195 1.33203 12.6668V14.0001M10.6654 2.08545C11.8415 2.39036 12.6628 3.45176 12.6628 4.66678C12.6628 5.8818 11.8415 6.94321 10.6654 7.24812M14.6654 14.0001V12.6668C14.6645 11.4515 13.842 10.3906 12.6654 10.0868" stroke="#9A9A9A" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M3.33203 4.66667C3.33203 6.13844 4.52692 7.33333 5.9987 7.33333C7.47047 7.33333 8.66536 6.13844 8.66536 4.66667C8.66536 3.19489 7.47047 2 5.9987 2C4.52692 2 3.33203 3.19489 3.33203 4.66667H3.33203" stroke="#9A9A9A" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const SwipeSideIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M7.33333 11.3332L4 7.99984L7.33333 4.6665M12 11.3332L8.66667 7.99984L12 4.6665" stroke="#9A9A9A" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const BioAgeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M22 12H19.52C18.6218 11.9981 17.8325 12.5952 17.59 13.46L15.24 21.82C15.2089 21.9267 15.1111 22 15 22C14.8889 22 14.7911 21.9267 14.76 21.82L9.24 2.18C9.20889 2.07333 9.11111 2 9 2C8.88889 2 8.79111 2.07333 8.76 2.18L6.41 10.54C6.16849 11.4013 5.38448 11.9974 4.49 12H2" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const MetabolismIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M12 3C12.6667 5.66667 14 7.83333 16 9.5C18 11.1667 19 13 19 15C19 18.8634 15.8634 22 12 22C8.13659 22 5 18.8634 5 15C5 13.9181 5.35089 12.8655 6 12C6 13.3798 7.12021 14.5 8.5 14.5C9.87979 14.5 11 13.3798 11 12C11 10 9.5 9 9.5 7C9.5 5.66667 10.3333 4.33333 12 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const HormonesIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="24" viewBox="0 0 22 24" fill="none" aria-hidden="true">
    <path d="M21.498 2.24562e-05H17.593C17.4987 -0.000898863 17.4064 0.0265487 17.3279 0.0787996C17.2494 0.131051 17.1885 0.20569 17.153 0.293022C17.1151 0.38065 17.1041 0.4776 17.1216 0.571477C17.139 0.665353 17.1841 0.75189 17.251 0.820022L18.159 1.72802C18.259 1.82402 18.259 1.98302 18.159 2.07902L16.138 4.13902C16.0942 4.17157 16.0411 4.18915 15.9865 4.18915C15.9319 4.18915 15.8788 4.17157 15.835 4.13902C14.5664 3.33292 13.0583 2.98986 11.5659 3.1679C10.0734 3.34593 8.68835 4.03413 7.645 5.11602C3.645 4.46802 0.014 7.54702 0 11.598C0.00197299 13.0005 0.456132 14.365 1.29506 15.4889C2.13399 16.6128 3.31297 17.4363 4.657 17.837C4.761 17.867 4.832 17.963 4.832 18.071V18.842C4.832 18.9067 4.80629 18.9688 4.76053 19.0146C4.71478 19.0603 4.65271 19.086 4.588 19.086H4.158C3.9856 19.0596 3.80952 19.0707 3.64182 19.1186C3.47413 19.1666 3.31878 19.2502 3.18642 19.3638C3.05407 19.4774 2.94784 19.6183 2.87501 19.7768C2.80218 19.9353 2.76447 20.1076 2.76447 20.282C2.76447 20.4564 2.80218 20.6288 2.87501 20.7873C2.94784 20.9458 3.05407 21.0866 3.18642 21.2002C3.31878 21.3138 3.47413 21.3975 3.64182 21.4454C3.80952 21.4933 3.9856 21.5045 4.158 21.478H4.638C4.772 21.478 4.881 21.588 4.881 21.722V22.201C4.86742 22.3677 4.88851 22.5353 4.94296 22.6934C4.9974 22.8514 5.08401 22.9965 5.19732 23.1194C5.31064 23.2424 5.44819 23.3405 5.60132 23.4076C5.75444 23.4747 5.91982 23.5093 6.087 23.5093C6.25418 23.5093 6.41956 23.4747 6.57268 23.4076C6.72581 23.3405 6.86336 23.2424 6.97668 23.1194C7.08999 22.9965 7.1766 22.8514 7.23104 22.6934C7.28549 22.5353 7.30658 22.3677 7.293 22.201V21.722C7.29184 21.665 7.31071 21.6093 7.34634 21.5647C7.38197 21.5202 7.43209 21.4895 7.488 21.478H7.976C8.27774 21.4519 8.55872 21.3136 8.76344 21.0904C8.96816 20.8672 9.08174 20.5754 9.08174 20.2725C9.08174 19.9697 8.96816 19.6778 8.76344 19.4546C8.55872 19.2314 8.27774 19.0931 7.976 19.067H7.488C7.42408 19.0646 7.36344 19.0381 7.3182 18.9928C7.27297 18.9476 7.24647 18.8869 7.244 18.823V18.266C7.24598 18.2078 7.26875 18.1521 7.30818 18.1092C7.34762 18.0663 7.40112 18.0389 7.459 18.032C8.857 17.8216 10.1505 17.1679 11.149 16.167C15.143 16.765 18.747 13.703 18.803 9.66502C18.818 8.42477 18.4795 7.20589 17.827 6.15102C17.7936 6.10948 17.7755 6.0578 17.7755 6.00452C17.7755 5.95125 17.7936 5.89957 17.827 5.85802L19.887 3.79802C19.9094 3.77358 19.9365 3.75403 19.9668 3.7406C19.9971 3.72718 20.0299 3.72017 20.063 3.72002C20.129 3.72302 20.192 3.75002 20.238 3.79802L21.136 4.69602C21.2042 4.76305 21.2906 4.80856 21.3845 4.8269C21.4783 4.84523 21.5755 4.83558 21.664 4.79915C21.7524 4.76271 21.8281 4.7011 21.8818 4.62196C21.9355 4.54282 21.9648 4.44965 21.966 4.35402V0.450022C21.9583 0.330212 21.9059 0.217645 21.8193 0.134527C21.7327 0.0514089 21.618 0.00377533 21.498 0.00102246M12.711 13.757C13.0077 12.914 13.1287 12.0192 13.0666 11.1277C13.0045 10.2362 12.7606 9.36677 12.35 8.57302C12.2773 8.43013 12.177 8.30308 12.0549 8.19921C11.9328 8.09535 11.7913 8.01675 11.6386 7.96795C11.4859 7.91916 11.325 7.90114 11.1653 7.91495C11.0056 7.92875 10.8502 7.9741 10.7081 8.04838C10.5661 8.12265 10.4402 8.22437 10.3377 8.34764C10.2352 8.47092 10.1582 8.6133 10.1111 8.76654C10.064 8.91978 10.0478 9.08084 10.0634 9.24039C10.079 9.39993 10.1261 9.5548 10.202 9.69602C10.522 10.296 10.682 10.968 10.671 11.648C10.667 14.812 7.24 16.786 4.501 15.201C1.762 13.616 1.767 9.66102 4.509 8.08102C5.03275 7.7795 5.61668 7.59749 6.219 7.54802C5.96005 8.22514 5.81803 8.94133 5.799 9.66602C5.79792 10.952 6.1783 12.2093 6.892 13.279C7.07768 13.5258 7.35072 13.6923 7.65518 13.7443C7.95964 13.7964 8.27246 13.73 8.52955 13.5588C8.78665 13.3876 8.96854 13.1246 9.03798 12.8236C9.10741 12.5227 9.05912 12.2065 8.903 11.94C7.149 9.30702 8.903 5.76202 12.06 5.55902C15.217 5.35602 17.41 8.64702 16.008 11.483C15.6945 12.1169 15.2227 12.6591 14.6383 13.0573C14.0539 13.4555 13.3766 13.6962 12.672 13.756L12.711 13.757Z" fill="white"/>
  </svg>
);

const HeartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M2 9.49979C2.00004 7.22173 3.40444 5.17948 5.53161 4.36419C7.65877 3.5489 10.0684 4.12933 11.591 5.82379C11.6969 5.93701 11.845 6.00127 12 6.00127C12.155 6.00127 12.3031 5.93701 12.409 5.82379C13.9271 4.11799 16.3426 3.53003 18.4749 4.34727C20.6071 5.16452 22.0109 7.2163 22 9.49979C22 11.7898 20.5 13.4998 19 14.9998L13.508 20.3128C13.1311 20.7457 12.5863 20.9958 12.0123 20.9994C11.4383 21.0031 10.8904 20.7599 10.508 20.3318L5 14.9998C3.5 13.4998 2 11.7998 2 9.49979" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const LiverIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M14.0005 2V8C14.0003 8.33548 14.0846 8.66561 14.2455 8.96L19.7555 19.04C20.0945 19.6597 20.0816 20.4124 19.7213 21.02C19.361 21.6276 18.7069 22.0002 18.0005 22H6.00046C5.29404 22.0002 4.63993 21.6276 4.27965 21.02C3.91938 20.4124 3.90638 19.6597 4.24546 19.04L9.75546 8.96C9.91635 8.66561 10.0006 8.33548 10.0005 8V2M6.45346 15H17.5475M8.50046 2H15.5005" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const HEALTH_AREAS = [
  { id: 'bio-age', label: 'Bio Age', Icon: BioAgeIcon },
  { id: 'metabolism', label: 'Metabolism', Icon: MetabolismIcon },
  { id: 'hormones', label: 'Hormones', Icon: HormonesIcon },
  { id: 'heart', label: 'Heart', Icon: HeartIcon },
  { id: 'liver', label: 'Liver', Icon: LiverIcon },
];

const BIOMARKER_BENEFITS = [
  {
    title: 'Early Risk Detection',
    description: 'Detect risks years before their symptoms develop.',
  },
  {
    title: 'Deeper Than Standard Blood Tests',
    description: 'Identifies subtle patterns across multiple markers to reveal how your metabolism, organs, and hormones are truly functioning.',
  },
  {
    title: 'Personalized Health Intelligence',
    description: 'Helps you understand how your body responds to nutrition, lifestyle, and stress enabling personalized decisions that improve energy, longevity, and overall health.',
  },
];

const AI_SUGGESTED_TESTS = [
  {
    id: 'ai-liver-1',
    label: 'Liver Test',
    description: 'Your Liver markers were at high risk in previous Bio-AI Report',
  },
  {
    id: 'ai-liver-2',
    label: 'Liver Test',
    description: 'Your Liver markers were at high risk in previous Bio-AI Report',
  },
];

const AiSuggestedIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <path d="M11.7004 12.3859L10.9621 14.9684C10.6854 15.935 9.31542 15.935 9.03875 14.9684L8.30125 12.3859C8.25456 12.2225 8.16701 12.0737 8.04686 11.9536C7.92672 11.8335 7.77795 11.7459 7.61458 11.6992L5.03208 10.9617C4.06542 10.6851 4.06542 9.31505 5.03208 9.03838L7.61458 8.30088C7.77795 8.25419 7.92672 8.16664 8.04686 8.0465C8.16701 7.92635 8.25456 7.77758 8.30125 7.61422L9.03875 5.03172C9.31542 4.06505 10.6854 4.06505 10.9621 5.03172L11.6996 7.61422C11.7463 7.77758 11.8338 7.92635 11.954 8.0465C12.0741 8.16664 12.2229 8.25419 12.3862 8.30088L14.9687 9.03838C15.9354 9.31505 15.9354 10.6851 14.9687 10.9617L12.3862 11.6992C12.2229 11.7459 12.0741 11.8335 11.954 11.9536C11.8338 12.0737 11.7463 12.2225 11.6996 12.3859M16.3087 16.43L15.9954 17.6867C15.9537 17.8551 15.7146 17.8551 15.6721 17.6867L15.3579 16.43C15.3506 16.4009 15.3354 16.3742 15.3142 16.353C15.2929 16.3317 15.2663 16.3166 15.2371 16.3092L13.9804 15.9951C13.8121 15.9534 13.8121 15.7142 13.9804 15.6717L15.2371 15.3576C15.2663 15.3502 15.2929 15.3351 15.3142 15.3138C15.3354 15.2925 15.3506 15.2659 15.3579 15.2367L15.6721 13.98C15.7137 13.8117 15.9529 13.8117 15.9954 13.98L16.3096 15.2367C16.3169 15.2659 16.3321 15.2925 16.3533 15.3138C16.3746 15.3351 16.4012 15.3502 16.4304 15.3576L17.6871 15.6717C17.8554 15.7134 17.8554 15.9526 17.6871 15.9951L16.4304 16.3092C16.4012 16.3166 16.3746 16.3317 16.3533 16.353C16.3321 16.3742 16.3161 16.4009 16.3087 16.43ZM4.64208 4.76338L4.32875 6.02005C4.28708 6.18838 4.04708 6.18838 4.00542 6.02005L3.69125 4.76338C3.68389 4.73421 3.66877 4.70758 3.6475 4.6863C3.62622 4.66503 3.59959 4.64991 3.57042 4.64255L2.31375 4.32838C2.14542 4.28672 2.14542 4.04672 2.31375 4.00505L3.57042 3.69088C3.59959 3.68352 3.62622 3.66841 3.6475 3.64713C3.66877 3.62586 3.68389 3.59922 3.69125 3.57005L4.00542 2.31338C4.04708 2.14505 4.28708 2.14505 4.32875 2.31338L4.64292 3.57005C4.65028 3.59922 4.66539 3.62586 4.68667 3.64713C4.70794 3.66841 4.73458 3.68352 4.76375 3.69088L6.02042 4.00505C6.18875 4.04672 6.18875 4.28672 6.02042 4.32838L4.76375 4.64255C4.73458 4.64991 4.70794 4.66503 4.68667 4.6863C4.66539 4.70758 4.64944 4.73421 4.64208 4.76338Z" stroke="url(#paint0_linear_2977_9794)" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
    <defs>
      <linearGradient id="paint0_linear_2977_9794" x1="10.0004" y1="2.18713" x2="10.0004" y2="17.813" gradientUnits="userSpaceOnUse">
        <stop stopColor="#435FF6"/>
        <stop offset="1" stopColor="#14AFAF"/>
      </linearGradient>
    </defs>
  </svg>
);

const FAQ_ITEMS = [
  {
    id: 'faq-water',
    question: 'Can I drink water during fasting?',
    answer: 'Yes, drink enough water to keep yourself hydrated. Avoid adding sweeteners or flavors to the water.',
  },
  {
    id: 'faq-vaccinated',
    question: 'Are the home collection staff vaccinated?',
    answer: 'Yes, all home collection staff follow strict safety protocols and are fully vaccinated as per policy.',
  },
  {
    id: 'faq-reports',
    question: 'How do I access my reports?',
    answer: 'Reports will be available in your profile under reports as soon as processing is completed.',
  },
];

const WHY_PACKAGE_POINTS = [
  'Gives you a complete picture of your health in one check.',
  'Detects lifestyle-related risks early, such as diabetes, cholesterol, and thyroid issues.',
  'Tracks vital organ health - liver, kidney, heart, and more.',
  'Helps spot vitamin or mineral deficiencies that affect energy and immunity.',
  'Supports timely prevention of common conditions like anemia and infections.',
  'Useful for regular monitoring if you already have a medical condition.',
  'Guides doctors to suggest the right lifestyle changes or treatment.',
];

const ABOUT_PACKAGE_COPY = [
  'This package offers a complete view of your health with tests for vital organs, sugar, cholesterol, vitamins, and minerals. Along with routine health checks, it measures biological age, metabolic age, and oxidative stress to show how your body is aging and coping with lifestyle choices.',
  'It helps detect hidden risks like diabetes, thyroid, heart, or liver issues at an early stage, while also highlighting deficiencies that affect energy and immunity. Regular use of this package supports disease prevention, better treatment planning, and overall well-being.',
];

const SAMPLE_ITEMS = [
  {
    id: 'blood',
    label: 'Blood',
    description: 'Our phlebotomist will draw a blood sample, typically from a vein in your inner elbow.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path fillRule="evenodd" clipRule="evenodd" d="M12.6407 0.268341L15.7529 3.3764C15.9133 3.54218 16.002 3.76421 16 3.99467C15.998 4.22514 15.9054 4.4456 15.7422 4.60857C15.579 4.77153 15.3583 4.86398 15.1275 4.86598C14.8967 4.86798 14.6744 4.77939 14.5084 4.61927L13.2629 5.86214L14.8182 7.41617C14.9023 7.49726 14.9693 7.59425 15.0154 7.70149C15.0616 7.80872 15.0858 7.92406 15.0869 8.04077C15.0879 8.15748 15.0656 8.27323 15.0214 8.38125C14.9771 8.48927 14.9117 8.58741 14.8291 8.66994C14.7465 8.75247 14.6482 8.81774 14.54 8.86193C14.4319 8.90613 14.316 8.92837 14.1991 8.92735C14.0822 8.92634 13.9667 8.90209 13.8593 8.85603C13.752 8.80996 13.6548 8.743 13.5736 8.65905L12.9522 8.03761L7.97315 13.01C7.47799 13.5043 6.80649 13.782 6.10633 13.782C5.40616 13.782 4.73466 13.5043 4.2395 13.01L1.49162 15.7533C1.32562 15.9134 1.10329 16.002 0.872516 16C0.64174 15.998 0.420984 15.9055 0.257794 15.7426C0.0946046 15.5796 0.00203866 15.3591 3.32725e-05 15.1287C-0.00197211 14.8982 0.0867434 14.6762 0.247072 14.5104L2.99407 11.7671C2.74883 11.5222 2.55429 11.2315 2.42156 10.9116C2.28884 10.5916 2.22053 10.2487 2.22053 9.90236C2.22053 9.55603 2.28884 9.2131 2.42156 8.89315C2.55429 8.57319 2.74883 8.28248 2.99407 8.03761L7.97315 3.06524L7.35088 2.44381C7.26681 2.36272 7.19976 2.26573 7.15363 2.1585C7.1075 2.05126 7.08322 1.93592 7.08221 1.81921C7.08119 1.7025 7.10346 1.58675 7.14772 1.47873C7.19197 1.37071 7.25733 1.27257 7.33997 1.19004C7.42261 1.10751 7.52088 1.04224 7.62905 0.998048C7.73722 0.953852 7.85312 0.931612 7.96999 0.932627C8.08685 0.933641 8.20235 0.957889 8.30973 1.00395C8.41712 1.05002 8.51424 1.11698 8.59543 1.20093L10.1516 2.75409L11.3961 1.51121C11.312 1.43013 11.245 1.33314 11.1989 1.2259C11.1527 1.11866 11.1285 1.00332 11.1274 0.886614C11.1264 0.769904 11.1487 0.654161 11.193 0.546138C11.2372 0.438115 11.3026 0.339976 11.3852 0.257446C11.4678 0.174917 11.5661 0.10965 11.6743 0.0654543C11.7825 0.0212586 11.8984 -0.00098099 12.0152 3.31872e-05C12.1321 0.00104736 12.2476 0.025295 12.355 0.0713613C12.4624 0.117428 12.5595 0.18439 12.6407 0.268341ZM9.21771 4.30812L7.97315 5.55187L8.59543 6.17242C8.67721 6.25403 8.74209 6.35093 8.78637 6.45757C8.83064 6.56422 8.85346 6.67854 8.8535 6.79399C8.85354 6.90944 8.83081 7.02377 8.7866 7.13045C8.7424 7.23713 8.67759 7.33407 8.59587 7.41573C8.51415 7.4974 8.41713 7.56219 8.31033 7.60641C8.20354 7.65063 8.08907 7.67341 7.97347 7.67345C7.85786 7.67349 7.74337 7.65079 7.63655 7.60665C7.52973 7.56251 7.43265 7.49778 7.35088 7.41617L6.7286 6.79474L6.10633 7.41617L6.7286 8.03761C6.81267 8.11869 6.87972 8.21568 6.92585 8.32292C6.97198 8.43016 6.99626 8.5455 6.99727 8.66221C6.99829 8.77892 6.97602 8.89466 6.93176 9.00269C6.88751 9.11071 6.82215 9.20885 6.73951 9.29138C6.65687 9.37391 6.5586 9.43917 6.45043 9.48337C6.34226 9.52757 6.22636 9.5498 6.10949 9.54879C5.99263 9.54778 5.87713 9.52353 5.76975 9.47746C5.66236 9.4314 5.56524 9.36443 5.48405 9.28048L4.86177 8.65905L4.2395 9.28048C4.15766 9.36211 4.09274 9.45906 4.04845 9.56576C4.00416 9.67247 3.98136 9.78685 3.98136 9.90236C3.98136 10.0179 4.00416 10.1322 4.04845 10.239C4.09274 10.3457 4.15766 10.4426 4.2395 10.5242L5.48405 11.7671C5.64911 11.9319 5.87294 12.0245 6.10633 12.0245C6.33971 12.0245 6.56355 11.9319 6.7286 11.7671L11.7077 6.79474L9.21771 4.30812ZM12.6415 2.75409L11.3961 3.99784L12.0184 4.61927L13.2638 3.3764L12.6415 2.75409Z" fill="url(#paint0_linear_3045_15364)"/>
        <defs>
          <linearGradient id="paint0_linear_3045_15364" x1="0.5" y1="17" x2="16" y2="2.5" gradientUnits="userSpaceOnUse">
            <stop stopColor="#7C3AED" stopOpacity="0.7"/>
            <stop offset="1" stopColor="#0FB9A8"/>
          </linearGradient>
        </defs>
      </svg>
    ),
  },
  {
    id: 'urine',
    label: 'Urine',
    description: 'Our phlebotomist will provide a clean, sterile container for you to collect a urine sample',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path fillRule="evenodd" clipRule="evenodd" d="M0.390667 0.390667C0.140601 0.640657 7.55165e-05 0.97974 0 1.33333V3.55556H0.950222C0.950222 3.57511 0.950815 3.59482 0.952 3.61467L1.72267 15.1702C1.73766 15.3951 1.83752 15.6059 2.00205 15.76C2.16658 15.914 2.38349 15.9998 2.60889 16H12.9467C13.1721 15.9999 13.3892 15.9142 13.5538 15.7601C13.7184 15.6061 13.8183 15.3952 13.8333 15.1702L14.604 3.61467C14.6052 3.59499 14.6058 3.57527 14.6058 3.55556H16V1.33333C16.0006 1.07108 15.9237 0.814496 15.7788 0.595897C15.6339 0.377298 15.4276 0.206458 15.1858 0.104889C15.0215 0.0355669 14.845 -9.95365e-05 14.6667 2.08634e-07H1.33333C0.97974 7.57252e-05 0.640657 0.140601 0.390667 0.390667ZM13.7164 3.55556H1.83911L1.95778 5.33333H6.66667C6.90241 5.33333 7.12851 5.42698 7.2952 5.59368C7.4619 5.76038 7.55555 5.98647 7.55555 6.22222V7.11111H13.4796L13.7164 3.55556ZM2.27289 6.22222L2.61867 12.4444H6.66667V6.22222H2.27289ZM2.22222 2.53956H1.33333V1.016H2.22222V2.53956ZM4 1.016H3.11111V2.53956H4V1.016ZM5.77778 2.53956H4.88889V1.016H5.77778V2.53956ZM7.55555 1.016H6.66667V2.53956H7.55555V1.016ZM9.33333 2.53956H8.44444V1.016H9.33333V2.53956ZM11.1111 1.016H10.2222V2.53956H11.1111V1.016ZM12.8889 2.53956H12V1.016H12.8889V2.53956ZM14.6667 1.016H13.7778V2.53956H14.6667V1.016Z" fill="url(#paint0_linear_3045_15370)"/>
        <defs>
          <linearGradient id="paint0_linear_3045_15370" x1="0.5" y1="17" x2="16" y2="2.5" gradientUnits="userSpaceOnUse">
            <stop stopColor="#7C3AED" stopOpacity="0.7"/>
            <stop offset="1" stopColor="#0FB9A8"/>
          </linearGradient>
        </defs>
      </svg>
    ),
  },
];

const PREPARATION_GROUPS = [
  {
    id: 'blood',
    title: 'Blood',
    tone: 'teal',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M10 16L11.5 17.5M14 8L12.5 6.5M15 2C13.202 3.998 12.482 5.995 12.193 7.993M16.5 10.5L17.5 11.5M17 6L14.109 3.109M2 15C8.667 9 15.333 15 22 9M20 9L20.891 9.891M3.109 14.109L4 15M6.5 12.5L7.5 13.5M7 18L9.891 20.891M9 22C10.798 20.002 11.518 18.005 11.807 16.007" stroke="#55F0E6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    points: [
      'Follow the fasting instructions shared for your package. Only plain water is allowed.',
      'Skip iron or vitamin supplements for 24 hours before sample collection.',
      'Take regular medicines (like thyroid) unless your doctor tells you otherwise.',
      'Drink enough water so veins are easy to access.',
    ],
  },
  {
    id: 'urine',
    title: 'Urine',
    tone: 'violet',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M10 16L11.5 17.5M14 8L12.5 6.5M15 2C13.202 3.998 12.482 5.995 12.193 7.993M16.5 10.5L17.5 11.5M17 6L14.109 3.109M2 15C8.667 9 15.333 15 22 9M20 9L20.891 9.891M3.109 14.109L4 15M6.5 12.5L7.5 13.5M7 18L9.891 20.891M9 22C10.798 20.002 11.518 18.005 11.807 16.007" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    points: [
      'Collect the first morning midstream urine (discard the first few drops, collect the middle stream).',
      'Use only the sterile container provided for collection.',
      'Ensure the area is clean before collecting the sample',
      'Submit the urine sample on the same day for accurate results.',
    ],
  },
];

const PARAMETER_GROUPS = [
  {
    id: 'liver',
    title: 'Liver Function',
    items: ['Bilirubin', 'Albumin', 'SGOT', 'SGPT', 'ALP', ''],
    locked: false,
  },
  {
    id: 'kidney',
    title: 'Kidney Function',
    items: ['Creatinine', 'BUN', 'Uric Acid', 'Calcium', '', ''],
    locked: false,
  },
  {
    id: 'thyroid',
    title: 'Kidney Function',
    items: ['Creatinine', 'BUN', 'Uric Acid', 'Calcium', '', ''],
    locked: true,
  },
  {
    id: 'heart',
    title: 'Heart Function',
    items: ['Troponin', 'CK-MB', 'LDH', 'Apo-A1', 'Apo-B', ''],
    locked: false,
  },
];

const MISSING_VALUE = '-';

const toCollectionLabel = (value) => {
  const normalized = String(value || '').trim().toLowerCase();

  if (normalized === 'home_collection') {
    return 'Home Sample Collection';
  }

  if (normalized === 'lab_collection') {
    return 'Lab Sample Collection';
  }

  if (!normalized) {
    return MISSING_VALUE;
  }

  return normalized
    .split('_')
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');
};

const toGenderLabel = (value) => {
  const normalized = String(value || '').trim().toLowerCase();

  if (normalized === 'male') {
    return 'For men';
  }

  if (normalized === 'female') {
    return 'For women';
  }

  if (normalized === 'both') {
    return 'For men & women';
  }

  return MISSING_VALUE;
};

const extractTagLabels = (tags) => {
  if (!Array.isArray(tags)) {
    return [];
  }

  return tags
    .map((tag) => {
      if (typeof tag === 'string' || typeof tag === 'number') {
        return String(tag).trim();
      }

      if (tag && typeof tag === 'object') {
        return String(tag.tag_name || tag.name || '').trim();
      }

      return '';
    })
    .filter(Boolean);
};

const extractReasonPoints = (reasons) => {
  if (!Array.isArray(reasons)) {
    return [];
  }

  return reasons
    .flatMap((reason) => String(reason?.reason_text || '').split('\n'))
    .map((point) => point.trim())
    .filter(Boolean);
};

const extractAboutParagraphs = (aboutText) => {
  return String(aboutText || '')
    .split('\n')
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
};

const formatCurrency = (value) => {
  const parsedValue = Number(value);

  if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
    return MISSING_VALUE;
  }

  return `₹ ${parsedValue.toLocaleString('en-IN')}`;
};

const toDiscountLabel = (discountPercent, price, originalPrice) => {
  const parsedDiscount = Number(discountPercent);
  if (Number.isFinite(parsedDiscount) && parsedDiscount > 0) {
    return `${Math.round(parsedDiscount)}% OFF`;
  }

  const current = Number(price);
  const original = Number(originalPrice);
  if (Number.isFinite(current) && Number.isFinite(original) && original > current && current > 0) {
    return `${Math.round(((original - current) / original) * 100)}% OFF`;
  }

  return MISSING_VALUE;
};

const PackageDetailsPage = ({ onBack, variant = 'default', profileName = 'User', packageId = null, packageCard = null, onCustomBookingConfirmed }) => {
  const isCustomReview = variant === 'custom-review';
  const trimmedProfileName = String(profileName || '').trim() || 'User';
  const customPackageTitle = `${trimmedProfileName}'s Custom Package`;
  const [activeTab, setActiveTab] = useState('home');
  const [order, setOrder] = useState([0, 1, 2]);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef(0);
  const didMoveRef = useRef(false);
  const swipeCount = useRef(0);
  const resetTimerRef = useRef(null);
  const [openFaqId, setOpenFaqId] = useState('faq-water');
  const [activeOverlay, setActiveOverlay] = useState('');
  const [packageDetail, setPackageDetail] = useState(null);
  const faqSectionRef = useRef(null);
  const biomarkerSectionRef = useRef(null);
  const biomarkerAnimationStartedRef = useRef(false);
  const biomarkerAnimationTimersRef = useRef([]);
  const [biomarkerStage, setBiomarkerStage] = useState(0);

  useEffect(() => {
    if (isCustomReview) {
      return undefined;
    }

    const clearAnimationTimers = () => {
      biomarkerAnimationTimersRef.current.forEach((timerId) => window.clearTimeout(timerId));
      biomarkerAnimationTimersRef.current = [];
    };

    const startBiomarkerAnimation = () => {
      if (biomarkerAnimationStartedRef.current) {
        return;
      }

      biomarkerAnimationStartedRef.current = true;
      setBiomarkerStage(1);

      [2, 3, 4, 5].forEach((stage, index) => {
        const timerId = window.setTimeout(() => {
          setBiomarkerStage(stage);
        }, (index + 1) * 260);

        biomarkerAnimationTimersRef.current.push(timerId);
      });
    };

    const sectionNode = biomarkerSectionRef.current;
    if (!sectionNode) {
      return () => {
        clearAnimationTimers();
      };
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry?.isIntersecting) {
          startBiomarkerAnimation();
          observer.disconnect();
        }
      },
      {
        threshold: 0.35,
      },
    );

    observer.observe(sectionNode);

    return () => {
      observer.disconnect();
      clearAnimationTimers();
    };
  }, [isCustomReview]);

  useEffect(() => {
    if (isCustomReview) {
      setPackageDetail(null);
      return;
    }

    const parsedPackageId = Number(packageId);
    if (!Number.isFinite(parsedPackageId) || parsedPackageId <= 0) {
      setPackageDetail(null);
      return;
    }

    let mounted = true;

    const loadPackageDetail = async () => {
      try {
        const response = await getDiagnosticPackageDetail(parsedPackageId);
        if (mounted) {
          setPackageDetail(response);
        }
      } catch {
        if (mounted) {
          setPackageDetail(null);
        }
      }
    };

    loadPackageDetail();

    return () => {
      mounted = false;
    };
  }, [isCustomReview, packageId]);

  const tagLabels = useMemo(() => extractTagLabels(packageDetail?.tags), [packageDetail]);

  const packageTitle = useMemo(() => {
    if (isCustomReview) {
      return customPackageTitle;
    }

    const fromApi = String(packageDetail?.package_name || '').trim();
    if (fromApi) {
      return fromApi;
    }

    const fromCard = String(packageCard?.title || '').trim();
    if (fromCard) {
      return fromCard;
    }

    return MISSING_VALUE;
  }, [customPackageTitle, isCustomReview, packageCard, packageDetail]);

  const primaryBadgeLabel = useMemo(() => {
    if (isCustomReview) {
      return 'Most Popular';
    }

    if (packageDetail?.is_most_popular) {
      return 'Most Popular';
    }

    return tagLabels[0] || MISSING_VALUE;
  }, [isCustomReview, packageDetail, tagLabels]);

  const collectionLabel = useMemo(() => {
    if (isCustomReview) {
      return 'Home Sample Collection';
    }

    return toCollectionLabel(packageDetail?.collection_type);
  }, [isCustomReview, packageDetail]);

  const genderLabel = useMemo(() => {
    if (isCustomReview) {
      return 'For men & women';
    }

    return toGenderLabel(packageDetail?.gender_suitability);
  }, [isCustomReview, packageDetail]);

  const reportLabel = useMemo(() => {
    return 'Reports in 24-48 hours';
  }, []);

  const bookingsLabel = useMemo(() => {
    if (isCustomReview) {
      return '100k+ booked';
    }

    const count = Number(packageDetail?.bookings_count);
    if (!Number.isFinite(count) || count < 0) {
      return MISSING_VALUE;
    }

    return `${count} booked`;
  }, [isCustomReview, packageDetail]);

  const detailCards = useMemo(() => {
    const testsCount = Number(packageDetail?.no_of_tests);
    const testsText = Number.isFinite(testsCount) && testsCount > 0 ? `${testsCount} Parameters` : MISSING_VALUE;

    return DETAIL_CARDS.map((card) => {
      if (card.id === 'tests' && !isCustomReview) {
        return {
          ...card,
          big: testsText,
        };
      }

      if (card.id === 'prep') {
        return {
          ...card,
          big: '10-12 hours Fasting',
        };
      }

      return card;
    });
  }, [isCustomReview, packageDetail]);

  const aboutParagraphs = useMemo(() => {
    if (isCustomReview) {
      return ABOUT_PACKAGE_COPY;
    }

    const parsed = extractAboutParagraphs(packageDetail?.about_text);
    return parsed.length > 0 ? parsed : [MISSING_VALUE];
  }, [isCustomReview, packageDetail]);

  const aboutPreview = useMemo(() => {
    const firstParagraph = aboutParagraphs[0] || MISSING_VALUE;

    if (firstParagraph.length <= 140) {
      return firstParagraph;
    }

    return `${firstParagraph.slice(0, 140).trimEnd()}...`;
  }, [aboutParagraphs]);

  const whyPackagePoints = useMemo(() => {
    if (isCustomReview) {
      return WHY_PACKAGE_POINTS;
    }

    const parsed = extractReasonPoints(packageDetail?.reasons);
    return parsed.length > 0 ? parsed : [MISSING_VALUE];
  }, [isCustomReview, packageDetail]);

  const testsOverlayTitle = useMemo(() => {
    const testsCount = Number(packageDetail?.no_of_tests);
    const value = Number.isFinite(testsCount) && testsCount > 0 ? String(testsCount) : MISSING_VALUE;
    return `Package includes ${value} tests`;
  }, [packageDetail]);

  const currentPriceText = useMemo(() => {
    if (isCustomReview) {
      return formatCurrency(packageCard?.pricing?.now);
    }

    return formatCurrency(packageDetail?.price);
  }, [isCustomReview, packageCard, packageDetail]);

  const oldPriceText = useMemo(() => {
    if (isCustomReview) {
      return formatCurrency(packageCard?.pricing?.old);
    }

    return formatCurrency(packageDetail?.original_price);
  }, [isCustomReview, packageCard, packageDetail]);

  const discountText = useMemo(() => {
    if (isCustomReview) {
      return String(packageCard?.pricing?.off || MISSING_VALUE);
    }

    return toDiscountLabel(
      packageDetail?.discount_percent,
      packageDetail?.price,
      packageDetail?.original_price,
    );
  }, [isCustomReview, packageCard, packageDetail]);

  const overlayInitialPackage = useMemo(() => {
    if (isCustomReview) {
      return null;
    }

    if (packageDetail && typeof packageDetail === 'object') {
      return packageDetail;
    }

    return packageCard || null;
  }, [isCustomReview, packageCard, packageDetail]);

  const frontCardIndex = order[0];

  const slotByCardIndex = useMemo(() => {
    const map = {};
    order.forEach((cardIdx, slotIdx) => {
      map[cardIdx] = slotIdx;
    });
    return map;
  }, [order]);

  const doSwipeLeft = () => {
    setIsDragging(false);
    setDragX(0);

    setOrder((prev) => {
      const next = [prev[1], prev[2], prev[0]];
      return next;
    });

    swipeCount.current += 1;
    if (swipeCount.current >= DETAIL_CARDS.length) {
      swipeCount.current = 0;
      if (resetTimerRef.current) {
        window.clearTimeout(resetTimerRef.current);
      }
      resetTimerRef.current = window.setTimeout(() => {
        setOrder([0, 1, 2]);
      }, 160);
    }
  };

  const handlePointerDown = (event) => {
    setIsDragging(true);
    dragStartX.current = event.clientX;
    didMoveRef.current = false;
  };

  const handlePointerMove = (event) => {
    if (!isDragging) {
      return;
    }

    const delta = event.clientX - dragStartX.current;
    if (Math.abs(delta) > 8) {
      didMoveRef.current = true;
    }
    setDragX(delta);
  };

  const handlePointerUp = () => {
    if (!isDragging) {
      return;
    }

    if (dragX <= -70) {
      doSwipeLeft();
      return;
    }

    setIsDragging(false);
    setDragX(0);
  };

  const handleTabClick = (tabKey) => {
    setActiveTab(tabKey);

    if (tabKey === 'faq') {
      setActiveOverlay('');
      if (faqSectionRef.current) {
        faqSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }
      return;
    }

    if (tabKey === 'about') {
      setActiveOverlay('about');
      return;
    }

    if (tabKey === 'why') {
      setActiveOverlay('why');
      return;
    }

    if (tabKey === 'samples') {
      setActiveOverlay('samples');
      return;
    }

    if (tabKey === 'preparation') {
      setActiveOverlay('prep');
      return;
    }

    if (tabKey === 'parameters') {
      setActiveOverlay('tests');
      return;
    }

    setActiveOverlay('');
  };

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;

    if (activeOverlay) {
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [activeOverlay]);

  const handleCloseOverlay = () => {
    setActiveOverlay('');
    setActiveTab('home');
  };

  const handleHighlightCardClick = (cardId) => {
    if (didMoveRef.current) {
      return;
    }

    if (cardId === 'samples') {
      setActiveOverlay('samples');
      setActiveTab('samples');
      return;
    }

    if (cardId === 'prep') {
      setActiveOverlay('prep');
      setActiveTab('preparation');
      return;
    }

    if (cardId === 'tests') {
      setActiveOverlay('tests');
      setActiveTab('parameters');
    }
  };

  return (
    <div className="package-details-page">
      <div className="package-details-page__fixed-top">
        <header className="package-details-page__header">
          <div className="package-details-page__header-left">
            <button type="button" className="package-details-page__back-btn" onClick={onBack} aria-label="Go back">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <h1 className="package-details-page__header-title">Package Details</h1>
          </div>
          <button type="button" className="package-details-page__cart-btn" aria-label="Open cart">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M17 18C17.5304 18 18.0391 18.2107 18.4142 18.5858C18.7893 18.9609 19 19.4696 19 20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22C16.4696 22 15.9609 21.7893 15.5858 21.4142C15.2107 21.0391 15 20.5304 15 20C15 18.89 15.89 18 17 18ZM1 2H4.27L5.21 4H20C20.2652 4 20.5196 4.10536 20.7071 4.29289C20.8946 4.48043 21 4.73478 21 5C21 5.17 20.95 5.34 20.88 5.5L17.3 11.97C16.96 12.58 16.3 13 15.55 13H8.1L7.2 14.63L7.17 14.75C7.17 14.8163 7.19634 14.8799 7.24322 14.9268C7.29011 14.9737 7.3537 15 7.42 15H19V17H7C6.46957 17 5.96086 16.7893 5.58579 16.4142C5.21071 16.0391 5 15.5304 5 15C5 14.65 5.09 14.32 5.24 14.04L6.6 11.59L3 4H1V2ZM7 18C7.53043 18 8.03914 18.2107 8.41421 18.5858C8.78929 18.9609 9 19.4696 9 20C9 20.5304 8.78929 21.0391 8.41421 21.4142C8.03914 21.7893 7.53043 22 7 22C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20C5 18.89 5.89 18 7 18ZM16 11L18.78 6H6.14L8.5 11H16Z" fill="white"/>
            </svg>
          </button>
        </header>

        <section className="package-details-page__tabs" aria-label="Package detail sections">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={`package-details-page__tab${activeTab === tab.key ? ' is-active' : ''}`}
              onClick={() => handleTabClick(tab.key)}
              aria-label={tab.label}
            >
              {tab.key === 'home' ? (activeTab === 'home' ? <HomeTabIconActive /> : <HomeTabIconInactive />) : tab.label}
            </button>
          ))}
        </section>
      </div>

      <div className="package-details-page__content">
        <section className="package-details-page__overview-box">
          <div className="package-details-page__badge-row">
            <div className="package-details-page__badge package-details-page__badge--popular">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <g clipPath="url(#clip0_2583_4686)">
                  <path d="M5.76341 1.14745C5.8081 1.05714 5.90015 1 6.00091 1C6.10167 1 6.19371 1.05714 6.23841 1.14745L7.39341 3.48695C7.54766 3.79969 7.84586 4.01656 8.19091 4.06695L10.7739 4.44495C10.8737 4.45941 10.9567 4.52931 10.9879 4.62525C11.0191 4.72119 10.9931 4.82652 10.9209 4.89695L9.05291 6.71595C8.8026 6.95951 8.68833 7.31073 8.74741 7.65495L9.18841 10.2249C9.20604 10.3248 9.16519 10.4259 9.08318 10.4854C9.00117 10.545 8.89237 10.5526 8.80291 10.5049L6.49391 9.29095C6.18511 9.12861 5.8162 9.12861 5.50741 9.29095L3.19891 10.5049C3.10948 10.5523 3.00089 10.5446 2.91906 10.4851C2.83722 10.4255 2.79642 10.3246 2.81391 10.2249L3.25441 7.65545C3.31366 7.31107 3.19937 6.95961 2.94891 6.71595L1.08091 4.89745C1.00806 4.82709 0.981688 4.72137 1.01295 4.62504C1.04421 4.52871 1.12763 4.45863 1.22791 4.44445L3.81041 4.06695C4.15583 4.01687 4.45447 3.79995 4.60891 3.48695L5.76341 1.14745" stroke="white" strokeLinecap="round" strokeLinejoin="round"/>
                </g>
                <defs>
                  <clipPath id="clip0_2583_4686">
                    <rect width="12" height="12" fill="white"/>
                  </clipPath>
                </defs>
              </svg>
              <span>{primaryBadgeLabel}</span>
            </div>

            <div className="package-details-page__badge package-details-page__badge--sample">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M7.5 10.5V6.5C7.5 6.22404 7.27596 6 7 6H5C4.72404 6 4.5 6.22404 4.5 6.5V10.5" stroke="#CCCCCC" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M1.5 5.00024C1.49993 4.7058 1.62962 4.4263 1.8545 4.23624L5.3545 1.23624C5.72719 0.921253 6.27281 0.921253 6.6455 1.23624L10.1455 4.23624C10.3704 4.4263 10.5001 4.7058 10.5 5.00024V9.50024C10.5 10.0522 10.0519 10.5002 9.5 10.5002H2.5C1.94808 10.5002 1.5 10.0522 1.5 9.50024V5.00024" stroke="#CCCCCC" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>{collectionLabel}</span>
            </div>
          </div>

          <h2 className="package-details-page__pack-title">{packageTitle}</h2>

          <div className={`package-details-page__meta-row${isCustomReview ? ' package-details-page__meta-row--compact' : ''}`}>
            <div className="package-details-page__meta-item">
              <MetaGenderIcon />
              <span>{genderLabel}</span>
            </div>
            <div className="package-details-page__meta-item">
              <MetaClockIcon />
              <span>{reportLabel}</span>
            </div>
            <div className="package-details-page__meta-item">
              <MetaPeopleIcon />
              <span>{bookingsLabel}</span>
            </div>
          </div>
        </section>

        <h3 className="package-details-page__hood-title">What&apos;s Under the Hood</h3>

        <section className="package-details-page__stack-area" aria-label="Package highlights" data-tour="package-details-cards">
          {detailCards.map((card, idx) => {
            const slot = slotByCardIndex[idx];
            const isFront = idx === frontCardIndex;
            const slotClass = `slot-${slot}`;
            const draggingStyle = isFront
              ? {
                transform: `translateX(${dragX}px) rotate(${dragX * 0.06}deg)`,
                transition: isDragging ? 'none' : 'transform 260ms ease',
              }
              : undefined;

            return (
              <article
                key={card.id}
                className={`package-highlight-card package-highlight-card--${card.variant} ${slotClass} ${isFront ? 'is-front' : ''}`}
                style={draggingStyle}
                onPointerDown={isFront ? handlePointerDown : undefined}
                onPointerMove={isFront ? handlePointerMove : undefined}
                onPointerUp={isFront ? handlePointerUp : undefined}
                onPointerCancel={isFront ? handlePointerUp : undefined}
                onClick={() => handleHighlightCardClick(card.id)}
              >
                <div className="package-highlight-card__icon-box">{card.icon}</div>
                <div className="package-highlight-card__small">{card.small}</div>
                <div className="package-highlight-card__big">{card.big}</div>
                <div className="package-highlight-card__arrow"><ArrowIcon /></div>
              </article>
            );
          })}
        </section>

        <div className="package-details-page__swipe-hint">
          <SwipeSideIcon />
          <span>SWIPE TO EXPLORE</span>
          <SwipeSideIcon />
        </div>

        <section className="package-details-page__about-section" aria-label="About package">
          <div className="package-details-page__about-head">
            <button type="button" className="package-details-page__about-title package-details-page__about-title--button" onClick={() => setActiveOverlay('about')}>
              About this package
            </button>
            <button type="button" className="package-details-page__see-more" onClick={() => setActiveOverlay('about')}>See more</button>
          </div>
          <p className="package-details-page__about-text">
            {aboutPreview}
          </p>
        </section>

        <section className="package-details-page__areas-section" aria-label="Health areas covered">
          <h3 className="package-details-page__areas-title">Health Areas Covered</h3>
          <div className="package-details-page__areas-row">
            {HEALTH_AREAS.map(({ id, label, Icon }) => (
              <div key={id} className="package-details-page__area-item">
                <div className="package-details-page__area-circle">
                  <Icon />
                </div>
                <span className="package-details-page__area-label">{label}</span>
              </div>
            ))}
          </div>
        </section>

        {isCustomReview ? (
          <section className="package-details-page__ai-section" aria-label="AI suggested tests">
            <div className="package-details-page__ai-head">
              <span className="package-details-page__ai-icon-box" aria-hidden="true">
                <AiSuggestedIcon />
              </span>
              <h3 className="package-details-page__ai-title">AI Suggested Tests</h3>
            </div>

            <div className="package-details-page__ai-box">
              {AI_SUGGESTED_TESTS.map((item) => (
                <article key={item.id} className="package-details-page__ai-item">
                  <div className="package-details-page__ai-item-copy">
                    <div className="package-details-page__ai-item-head">
                      <span className="package-details-page__ai-dot" aria-hidden="true" />
                      <span className="package-details-page__ai-label">{item.label}</span>
                    </div>
                    <p className="package-details-page__ai-copy">{item.description}</p>
                  </div>

                  <button type="button" className="package-details-page__ai-add-btn">
                    <span className="package-details-page__ai-add-text">Add</span>
                  </button>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {!isCustomReview ? (
          <section className="package-details-page__biomarker-section" aria-label="Why biomarker tests matter" ref={biomarkerSectionRef}>
            <h3 className="package-details-page__biomarker-title">Why Biomarker-Tests Matter</h3>

            <div className="package-details-page__biomarker-box">
              {BIOMARKER_BENEFITS.map((item, index) => (
                <div key={item.title} className="package-details-page__benefit-item">
                  <div className="package-details-page__benefit-marker-col" aria-hidden="true">
                    <div
                      className={`package-details-page__benefit-index ${biomarkerStage >= (index * 2) + 1 ? 'is-active' : ''}`}
                    >
                      {index + 1}
                    </div>
                    {index < BIOMARKER_BENEFITS.length - 1 ? (
                      <div
                        className={`package-details-page__benefit-line ${biomarkerStage >= (index * 2) + 2 ? 'is-active' : ''}`}
                      />
                    ) : null}
                  </div>

                  <div className="package-details-page__benefit-copy">
                    <h4>{item.title}</h4>
                    <p>{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        <section className="package-details-page__faq-section" aria-label="Frequently asked questions" ref={faqSectionRef}>
          <h3 className="package-details-page__faq-title">Frequently Asked Questions</h3>

          <div className="package-details-page__faq-list">
            {FAQ_ITEMS.map((item) => {
              const isOpen = openFaqId === item.id;

              return (
                <div key={item.id} className="package-details-page__faq-item">
                  <button
                    type="button"
                    className="package-details-page__faq-row"
                    onClick={() => setOpenFaqId((prev) => (prev === item.id ? '' : item.id))}
                  >
                    <span className="package-details-page__faq-question">{item.question}</span>
                    <span className="package-details-page__faq-toggle" aria-hidden="true">
                      {isOpen ? '−' : '+'}
                    </span>
                  </button>

                  {isOpen ? <p className="package-details-page__faq-answer">{item.answer}</p> : null}

                  <div className="package-details-page__faq-divider" />
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {activeOverlay !== 'patients' ? (
        <div className="package-details-page__book-bar" aria-label="Package booking bar">
          <div className="package-details-page__book-bar-inner">
            <div className="package-details-page__price-col">
              <span className="package-details-page__price-label">Package price:</span>
              <div className="package-details-page__price-line">
                <span className="package-details-page__price-current">{currentPriceText}</span>
                <span className="package-details-page__price-old">{oldPriceText}</span>
                <span className="package-details-page__price-off">{discountText}</span>
              </div>
            </div>

            <button type="button" className="package-details-page__book-cta" onClick={() => setActiveOverlay('patients')}>BOOK</button>
          </div>
        </div>
      ) : null}

      {activeOverlay && activeOverlay !== 'patients' ? (
        <div className="package-details-page__overlay" role="dialog" aria-modal="true" onClick={handleCloseOverlay}>
          <button type="button" className="package-details-page__overlay-close" aria-label="Close" onClick={handleCloseOverlay}>
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
              <rect width="32" height="32" rx="16" fill="#063533"/>
              <path d="M23.1992 8.75C23.2127 8.75003 23.2258 8.75513 23.2354 8.76465C23.2449 8.77417 23.25 8.78732 23.25 8.80078C23.25 8.81422 23.2448 8.82738 23.2354 8.83691L16.6006 15.4697L16.0703 16L16.6006 16.5303L23.2354 23.1631C23.2448 23.1726 23.25 23.1858 23.25 23.1992C23.25 23.2127 23.2449 23.2258 23.2354 23.2354C23.2258 23.2449 23.2127 23.25 23.1992 23.25C23.1858 23.25 23.1726 23.2448 23.1631 23.2354L16.5303 16.6006L16 16.0703L15.4697 16.6006L8.83691 23.2354C8.82738 23.2448 8.81422 23.25 8.80078 23.25C8.78732 23.25 8.77417 23.2449 8.76465 23.2354C8.75513 23.2258 8.75003 23.2127 8.75 23.1992C8.75 23.1858 8.75518 23.1726 8.76465 23.1631L15.3994 16.5303L15.9297 16L15.3994 15.4697L8.76465 8.83691C8.75998 8.83221 8.75644 8.82643 8.75391 8.82031C8.75136 8.81415 8.75 8.80745 8.75 8.80078C8.75002 8.79414 8.75136 8.78739 8.75391 8.78125C8.75646 8.77514 8.75996 8.76933 8.76465 8.76465C8.76933 8.75996 8.77514 8.75646 8.78125 8.75391C8.78739 8.75136 8.79414 8.75002 8.80078 8.75C8.80745 8.75 8.81415 8.75136 8.82031 8.75391C8.82643 8.75644 8.83221 8.75998 8.83691 8.76465L15.4697 15.3994L16 15.9297L16.5303 15.3994L23.1631 8.76465C23.1726 8.75518 23.1858 8.75 23.1992 8.75Z" fill="white" stroke="white" strokeWidth="1.5"/>
            </svg>
          </button>

          <div
            className={`package-details-page__overlay-sheet${activeOverlay === 'tests' ? ' is-tests' : ''}`}
            onClick={(event) => event.stopPropagation()}
          >
            <h3 className="package-details-page__overlay-title">
              {activeOverlay === 'why'
                ? 'Why this package?'
                : activeOverlay === 'about'
                  ? 'About the package'
                  : activeOverlay === 'samples'
                    ? 'Samples required'
                    : activeOverlay === 'prep'
                      ? 'Preparations'
                      : testsOverlayTitle}
            </h3>

            {activeOverlay === 'why' ? (
              <div className="package-details-page__overlay-points">
                {whyPackagePoints.map((point, index) => (
                  <div key={`${point}-${index}`} className="package-details-page__overlay-point">
                    <div className="package-details-page__overlay-index">{index + 1}</div>
                    <p>{point}</p>
                  </div>
                ))}
              </div>
            ) : null}

            {activeOverlay === 'about' ? (
              <div className="package-details-page__overlay-about-copy">
                {aboutParagraphs.map((paragraph, index) => (
                  <p key={`${paragraph}-${index}`}>{paragraph}</p>
                ))}
              </div>
            ) : null}

            {activeOverlay === 'samples' ? (
              <div className="package-details-page__samples-list">
                {SAMPLE_ITEMS.map((item) => (
                  <div key={item.id} className="package-details-page__sample-item">
                    <div className="package-details-page__sample-icon-box">{item.icon}</div>
                    <h4>{item.label}</h4>
                    <p>{item.description}</p>
                  </div>
                ))}
              </div>
            ) : null}

            {activeOverlay === 'prep' ? (
              <div className="package-details-page__prep-list">
                {PREPARATION_GROUPS.map((group) => (
                  <section
                    key={group.id}
                    className={`package-details-page__prep-card package-details-page__prep-card--${group.tone}`}
                    aria-label={`${group.title} preparation`}
                  >
                    <div className="package-details-page__prep-head">
                      {group.icon}
                      <h4>{group.title}</h4>
                    </div>

                    <div className={`package-details-page__prep-steps package-details-page__prep-steps--${group.tone}`}>
                      {group.points.map((point) => (
                        <div key={point} className="package-details-page__prep-step">
                          <p>{point}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            ) : null}

            {activeOverlay === 'tests' ? (
              <div className="package-details-page__tests-scroll">
                {PARAMETER_GROUPS.map((group) => (
                  <section key={group.id} className="package-details-page__test-card" aria-label={group.title}>
                    <div className="package-details-page__test-head">
                      <div className="package-details-page__test-icon-box">
                        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
                          <path d="M12.1667 6.33333H10.72C10.1961 6.33221 9.73563 6.68052 9.59417 7.185L8.22333 12.0617C8.20519 12.1239 8.14815 12.1667 8.08333 12.1667C8.01852 12.1667 7.96148 12.1239 7.94333 12.0617L4.72333 0.605C4.70519 0.542778 4.64815 0.5 4.58333 0.5C4.51852 0.5 4.46148 0.542778 4.44333 0.605L3.0725 5.48167C2.93162 5.98407 2.47428 6.33184 1.9525 6.33333H0.5" stroke="#90DF9E" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <h4>{group.title}</h4>
                    </div>

                    <div className="package-details-page__test-divider" />

                    <div className="package-details-page__test-grid">
                      {group.items.map((item, idx) => (
                        item ? (
                          <div key={`${group.id}-${item}-${idx}`} className="package-details-page__test-pill">
                            <svg xmlns="http://www.w3.org/2000/svg" width="11" height="8" viewBox="0 0 11 8" fill="none" aria-hidden="true">
                              <path d="M9.91536 0.583496L3.4987 7.00016L0.582031 4.0835" stroke="#90DF9E" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <span>{item}</span>
                          </div>
                        ) : <div key={`${group.id}-empty-${idx}`} />
                      ))}
                    </div>

                    {group.locked ? (
                      <div className="package-details-page__locked-layer" aria-hidden="true">
                        <div className="package-details-page__locked-icon">
                          <svg xmlns="http://www.w3.org/2000/svg" width="23" height="27" viewBox="0 0 23 27" fill="none">
                            <path d="M6.5 12V8.5C6.5 5.73858 8.73858 3.5 11.5 3.5C14.2614 3.5 16.5 5.73858 16.5 8.5V12" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                            <rect x="4" y="11" width="15" height="12" rx="2" fill="white"/>
                            <circle cx="11.5" cy="17" r="1.4" fill="#071018"/>
                          </svg>
                        </div>
                        <button type="button" className="package-details-page__locked-btn">Explore Other Packages</button>
                        <div className="package-details-page__locked-note">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                            <path d="M1.16406 7.00033C1.16406 10.2198 3.77789 12.8337 6.9974 12.8337C10.2169 12.8337 12.8307 10.2198 12.8307 7.00033C12.8307 3.78082 10.2169 1.16699 6.9974 1.16699C3.77789 1.16699 1.16406 3.78082 1.16406 7.00033V7.00033" stroke="white" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M7 9.33366V7.00033M7 4.66699H7.00583" stroke="white" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          <span>Locked markers available in higher packages</span>
                        </div>
                      </div>
                    ) : null}
                  </section>
                ))}

                <div className="package-details-page__overlay-grip package-details-page__overlay-grip--tests" aria-hidden="true" />
              </div>
            ) : null}

            {activeOverlay !== 'tests' ? <div className="package-details-page__overlay-grip" aria-hidden="true" /> : null}
          </div>
        </div>
      ) : null}

      {activeOverlay === 'patients' ? (
        <Suspense fallback={null}>
          <PatientSelectionOverlay
            open={activeOverlay === 'patients'}
            onClose={() => setActiveOverlay('')}
            customFlow={isCustomReview}
            initialPackage={overlayInitialPackage}
            onBookingConfirmed={isCustomReview ? onCustomBookingConfirmed : undefined}
          />
        </Suspense>
      ) : null}
    </div>
  );
};

export default PackageDetailsPage;